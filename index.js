var express = require('express');
var bodyParser = require("body-parser");
var logger = require('toto-logger');
let Validator = require('./validation/Validator');
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation

/**
 * This is an API controller to Toto APIs
 * It provides all the methods to create an API and it's methods & paths, to create the documentation automatically, etc.
 * Provides the following default paths:
 * '/'            : this is the default SMOKE (health check) path
 * '/publishes'   : this is the path that can be used to retrieve the list of topics that this API publishes events to
 */
class TotoAPIController {

    /**
     * The constructor requires the express app
     * Requires:
     * - apiName              : (mandatory) - the name of the api (e.g. expenses)
     * - config               : (mandatory) - a Config class that provides the following methods: 
     *                          * load() - loads the configuration, returns a Promise 
     *                          * getAuthorizedClientId() - provides the id of the client authorized to access this backend service. It can also provide null in case all clients can access the microservice.
     *                          * getAuthorizedFBClientId() - provides the id of the FB authorized client. Can be null. 
     * - totoEventPublisher   : (optional) - a TotoEventPublisher object that contains topics registrations
     *                          if this is passed, the API will give access to the published topics on the /publishes path
     * - totoEventConsumer    : (optional) - a TotoEventConsumer object that contains topics registrations
     *                          if this is passed, the API will give access to the listened topics on the /consumes path
     */
    constructor(apiName, config, totoEventPublisher, totoEventConsumer) {

        this.app = express();
        this.apiName = apiName;
        this.totoEventPublisher = totoEventPublisher;
        this.totoEventConsumer = totoEventConsumer;

        // Init the paths
        this.paths = [];

        config.load().then(() => {
            let authorizedGoogleClientId = config.getAuthorizedClientId ? config.getAuthorizedClientId() : null;
            let authorizedFBClientId = config.getAuthorizedFBClientId ? config.getAuthorizedFBClientId() : null;

            this.validator = new Validator(config.getProps ? config.getProps() : null, authorizedGoogleClientId, authorizedFBClientId);
        });

        // Initialize the basic Express functionalities
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-correlation-id, x-msg-id, auth-provider");
            res.header("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
            next();
        });

        this.app.use(bodyParser.json());
        this.app.use(busboy());
        this.app.use(express.static(path.join(__dirname, 'public')));

        // Add the standard Toto paths
        // Add the basic SMOKE api
        this.path('GET', '/', {
            do: (req) => {

                return new Promise((s, f) => {

                    return s({ api: apiName, status: 'running' })
                });
            }
        });

        // Add the /publishes path
        this.path('GET', '/produces', {
            do: (req) => {

                return new Promise((s, f) => {

                    if (this.totoEventPublisher != null) s({ topics: totoEventPublisher.getRegisteredTopics() });
                    else s({ topics: [] });
                });
            }
        })

        // Add the /consumes path
        this.path('GET', '/consumes', {
            do: (req) => {

                return new Promise((s, f) => {

                    if (this.totoEventConsumer != null) s({ topics: totoEventConsumer.getRegisteredTopics() });
                    else s({ topics: [] });
                })
            }
        })

        // Bindings
        this.staticContent = this.staticContent.bind(this);
        this.fileUploadPath = this.fileUploadPath.bind(this);
        this.path = this.path.bind(this);
    }

    /**
     * This method will register the specified path to allow access to the static content in the specified folder
     * e.g. staticContent('/img', '/app/img')
     */
    staticContent(path, folder) {

        this.app.use(path, express.static(folder));

    }

    streamGET(path, delegate) {

        this.paths.push({
            method: 'GET',
            path: path,
            delegate: delegate
        });

        this.app.route(path).get((req, res, next) => {

            this.validator.validate(req).then((validationResult) => {

                if (validationResult.errors) { res.status(400).type('application/json').send({ code: 400, message: 'Validation errors', errors: validationResult.errors }); return; }

                logger.apiIn(req.headers['x-correlation-id'], 'GET', path, req.headers['x-msg-id']);

                // Execute the GET
                delegate.do(req, validationResult.userContext).then((stream) => {
                    // Success
                    // stream must be a stream: e.g. var stream = bucket.file('Toast.jpg').createReadStream();
                    res.writeHead(200);

                    stream.on('data', (data) => {
                        res.write(data);
                    });

                    stream.on('end', () => {
                        res.end();
                    });
                }, (err) => {
                    // Log
                    logger.compute(req.headers['x-correlation-id'], err, 'error');
                    // If the err is a {code: 400, message: '...'}, then it's a validation error
                    if (err != null && err.code == '400') res.status(400).type('application/json').send(err);
                    // Failure
                    else res.status(500).type('application/json').send(err);
                });

            });
        });
    }

    /**
     * Adds a path that support uploading files
     *  - path:     the path as expected by express. E.g. '/upload'
     */
    fileUploadPath(path, delegate) {

        // Cache the path
        this.paths.push({
            method: 'POST',
            path: path,
            delegate: delegate
        });

        this.app.route(path).post((req, res, next) => {

            // Validating
            this.validator.validate(req).then((validationResult) => {

                if (validationResult.errors) { res.status(400).type('application/json').send({ code: 400, message: 'Validation errors', errors: validationResult.errors }); return; }

                logger.apiIn(req.headers['x-correlation-id'], 'POST', path, req.headers['x-msg-id']);

                var fstream;

                req.pipe(req.busboy);

                req.busboy.on('file', (fieldname, file, filename) => {

                    logger.compute(req.headers['x-correlation-id'], 'Uploading file ' + filename, 'info');

                    // DEfine the target dir
                    let dir = __dirname + '/app-docs';

                    // Ensure that the dir exists
                    fs.ensureDirSync(dir);

                    // Create the file stream
                    fstream = fs.createWriteStream(dir + '/' + filename);

                    // Pipe the file data to the stream
                    file.pipe(fstream);

                    // When done, call the delegate
                    fstream.on('close', () => {

                        delegate.do({ query: req.query, params: req.params, headers: req.headers, body: { filepath: dir + '/' + filename } }, validationResult.userContext).then((data) => {
                            // Success
                            res.status(200).type('application/json').send(data);

                        }, (err) => {
                            // Log
                            logger.compute(req.headers['x-correlation-id'], err, 'error');
                            // If the err is a {code: 400, message: '...'}, then it's a validation error
                            if (err != null && err.code == '400') res.status(400).type('application/json').send(err);
                            // Failure
                            else res.status(500).type('application/json').send(err);
                        });

                    });
                });
            });
        });

        // Log the added path
        console.log('[' + this.apiName + '] - Successfully added method ' + 'POST' + ' ' + path);
    }

    /**
     * Add a path to the app.
     * Requires:
     *  - method:   the HTTP method. Can be GET, POST, PUT, DELETE
     *  - path:     the path as expected by express. E.g. '/sessions/:id'
     *  - delegate: the delegate that exposes a do() function. Note that the delegate will always receive the entire req object
     */
    path(method, path, delegate) {

        // Cache the path
        this.paths.push({
            method: method,
            path: path,
            delegate: delegate
        });

        // Create a new express route
        if (method == 'GET') this.app.get(path, (req, res) => {

            // Validating
            this.validator.validate(req).then((validationResult) => {

                if (validationResult.errors) { res.status(400).type('application/json').send({ code: 400, message: 'Validation errors', errors: validationResult.errors }); return; }

                // Log the fact that a call has been received
                logger.apiIn(req.headers['x-correlation-id'], method, path, req.headers['x-msg-id']);

                // Execute the GET
                delegate.do(req, validationResult.userContext).then((data) => {
                    // Success
                    res.status(200).type('application/json').send(data);
                }, (err) => {
                    // Log
                    logger.compute(req.headers['x-correlation-id'], err, 'error');
                    // If the err is a {code: 400, message: '...'}, then it's a validation error
                    if (err != null && err.code == '400') res.status(400).type('application/json').send(err);
                    // Failure
                    else res.status(500).type('application/json').send(err);
                });
            });

        });
        else if (method == 'POST') this.app.post(path, (req, res) => {

            // Validating
            this.validator.validate(req).then((validationResult) => {

                if (validationResult.errors) { res.status(400).type('application/json').send({ code: 400, message: 'Validation errors', errors: validationResult.errors }); return; }

                // Log the fact that a call has been received
                logger.apiIn(req.headers['x-correlation-id'], method, path, req.headers['x-msg-id']);

                // Execute the POST
                delegate.do(req, validationResult.userContext).then((data) => {
                    // Success
                    res.status(201).type('application/json').send(data);
                }, (err) => {
                    // Log
                    logger.compute(req.headers['x-correlation-id'], err, 'error');
                    // If the err is a {code: 400, message: '...'}, then it's a validation error
                    if (err != null && err.code == '400') res.status(400).type('application/json').send(err);
                    // Failure
                    else res.status(500).type('application/json').send(err);
                });
            });

        });
        else if (method == 'DELETE') this.app.delete(path, (req, res) => {

            // Validating
            this.validator.validate(req).then((validationResult) => {

                if (validationResult.errors) { res.status(400).type('application/json').send({ code: 400, message: 'Validation errors', errors: validationResult.errors }); return; }

                // Log the fact that a call has been received
                logger.apiIn(req.headers['x-correlation-id'], method, path, req.headers['x-msg-id']);

                // Execute the DELETE
                delegate.do(req, validationResult.userContext).then((data) => {
                    // Success
                    res.status(200).type('application/json').send(data);
                }, (err) => {
                    // Log
                    logger.compute(req.headers['x-correlation-id'], err, 'error');
                    // If the err is a {code: 400, message: '...'}, then it's a validation error
                    if (err != null && err.code == '400') res.status(400).type('application/json').send(err);
                    // Failure
                    else res.status(500).type('application/json').send(err);
                });

            });
        });
        else if (method == 'PUT') this.app.put(path, (req, res) => {

            // Validating
            this.validator.validate(req).then((validationResult) => {

                if (validationResult.errors) { res.status(400).type('application/json').send({ code: 400, message: 'Validation errors', errors: validationResult.errors }); return; }

                // Log the fact that a call has been received
                logger.apiIn(req.headers['x-correlation-id'], method, path, req.headers['x-msg-id']);

                // Execute the PUT
                delegate.do(req, validationResult.userContext).then((data) => {
                    // Success
                    res.status(200).type('application/json').send(data);
                }, (err) => {
                    // Log
                    logger.compute(req.headers['x-correlation-id'], err, 'error');
                    // If the err is a {code: 400, message: '...'}, then it's a validation error
                    if (err != null && err.code == '400') res.status(400).type('application/json').send(err);
                    // Failure
                    else res.status(500).type('application/json').send(err);
                });
            });
        });

        // Log the added path
        console.log('[' + this.apiName + '] - Successfully added method ' + method + ' ' + path);
    }

    /**
     * Starts the ExpressJS app by listening on the standard port defined for Toto microservices
     */
    listen() {

        if (!this.validator) {
            console.log("[" + this.apiName + "] - Waiting for the configuration to load...");
            setTimeout(() => {this.listen()}, 300);
            return;
        }

        this.app.listen(8080, () => {
            console.log('[' + this.apiName + '] - Microservice up and running');
        });

    }
}

// Export the module
module.exports = TotoAPIController;