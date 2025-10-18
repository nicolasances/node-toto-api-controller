"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotoAPIController = exports.TotoControllerOptions = exports.SecretsManager = exports.Validator = exports.ValidationError = exports.LazyValidator = exports.ConfigMock = exports.googleAuthCheck = exports.basicallyHandleError = exports.correlationId = exports.TotoRuntimeError = exports.ExecutionContext = exports.AUTH_PROVIDERS = exports.Logger = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const connect_busboy_1 = __importDefault(require("connect-busboy"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const express_1 = __importDefault(require("express"));
const TotoLogger_1 = require("./logger/TotoLogger");
const Validator_1 = require("./validation/Validator");
const ExecutionContext_1 = require("./model/ExecutionContext");
const SmokeDelegate_1 = require("./dlg/SmokeDelegate");
const TotoRuntimeError_1 = require("./model/TotoRuntimeError");
var TotoLogger_2 = require("./logger/TotoLogger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return TotoLogger_2.Logger; } });
var AuthProviders_1 = require("./model/AuthProviders");
Object.defineProperty(exports, "AUTH_PROVIDERS", { enumerable: true, get: function () { return AuthProviders_1.AUTH_PROVIDERS; } });
var ExecutionContext_2 = require("./model/ExecutionContext");
Object.defineProperty(exports, "ExecutionContext", { enumerable: true, get: function () { return ExecutionContext_2.ExecutionContext; } });
var TotoRuntimeError_2 = require("./model/TotoRuntimeError");
Object.defineProperty(exports, "TotoRuntimeError", { enumerable: true, get: function () { return TotoRuntimeError_2.TotoRuntimeError; } });
var CorrelationId_1 = require("./util/CorrelationId");
Object.defineProperty(exports, "correlationId", { enumerable: true, get: function () { return CorrelationId_1.correlationId; } });
var ErrorUtil_1 = require("./util/ErrorUtil");
Object.defineProperty(exports, "basicallyHandleError", { enumerable: true, get: function () { return ErrorUtil_1.basicallyHandleError; } });
var GoogleAuthCheck_1 = require("./validation/GoogleAuthCheck");
Object.defineProperty(exports, "googleAuthCheck", { enumerable: true, get: function () { return GoogleAuthCheck_1.googleAuthCheck; } });
var Validator_2 = require("./validation/Validator");
Object.defineProperty(exports, "ConfigMock", { enumerable: true, get: function () { return Validator_2.ConfigMock; } });
Object.defineProperty(exports, "LazyValidator", { enumerable: true, get: function () { return Validator_2.LazyValidator; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return Validator_2.ValidationError; } });
Object.defineProperty(exports, "Validator", { enumerable: true, get: function () { return Validator_2.Validator; } });
var CrossCloudSecret_1 = require("./util/CrossCloudSecret");
Object.defineProperty(exports, "SecretsManager", { enumerable: true, get: function () { return CrossCloudSecret_1.SecretsManager; } });
class TotoControllerOptions {
    constructor() {
        this.debugMode = false;
        this.basePath = undefined; // Use to prepend a base path to all API paths, e.g. '/api/v1' or '/expenses/v1'
    }
}
exports.TotoControllerOptions = TotoControllerOptions;
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
     * - config               : (mandatory) - a TotoControllerConfig instance
     */
    constructor(apiName, config, options = new TotoControllerOptions()) {
        this.validator = new Validator_1.LazyValidator();
        this.app = (0, express_1.default)();
        this.apiName = apiName;
        this.logger = new TotoLogger_1.Logger(apiName);
        this.config = config;
        this.options = options;
        this.config.logger = this.logger;
        // Log some configuration properties
        if (options.debugMode)
            this.logger.compute("", `[TotoAPIController Debug] - Config Properties: ${JSON.stringify(config.getProps())}`);
        // Initialize the basic Express functionalities
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-correlation-id, x-msg-id, auth-provider, x-app-version, x-client, x-client-id");
            res.header("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
            next();
        });
        this.app.use(body_parser_1.default.json());
        this.app.use((0, connect_busboy_1.default)());
        this.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
        // Add the standard Toto paths
        // Add the basic SMOKE api and /health endpoint. 
        this.path('GET', '/', new SmokeDelegate_1.SmokeDelegate(), { noAuth: true, contentType: 'application/json', ignoreBasePath: true });
        this.path('GET', '/health', new SmokeDelegate_1.SmokeDelegate(), { noAuth: true, contentType: 'application/json', ignoreBasePath: true });
        // Bindings
        this.staticContent = this.staticContent.bind(this);
        this.fileUploadPath = this.fileUploadPath.bind(this);
        this.path = this.path.bind(this);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.config.load();
            this.validator = new Validator_1.Validator(this.config, this.logger, this.options.debugMode);
        });
    }
    /**
     * This method will register the specified path to allow access to the static content in the specified folder
     * e.g. staticContent('/img', '/app/img')
     */
    staticContent(path, folder, options) {
        // If a basepath is defined, prepend it to the path
        // Make sure that the basePath does not end with "/". If it does remove it. 
        const correctedPath = (this.options.basePath && (!options || !options.ignoreBasePath)) ? this.options.basePath.replace(/\/$/, '').trim() + path : path;
        this.app.use(path, express_1.default.static(folder));
    }
    /**
     *
     * @param {string} path the path to which this API is reachable
     * @param {function} delegate the delegate that will handle this call
     * @param {object} options options to configure this path:
     *  - contentType: (OPT, default null) provide the Content-Type header to the response
     */
    streamGET(path, delegate, options) {
        // If a basepath is defined, prepend it to the path
        // Make sure that the basePath does not end with "/". If it does remove it. 
        const correctedPath = (this.options.basePath && (!options || !options.ignoreBasePath)) ? this.options.basePath.replace(/\/$/, '').trim() + path : path;
        this.app.route(correctedPath).get((req, res, next) => {
            this.validator.validate(req, options).then((userContext) => {
                this.logger.apiIn(req.headers['x-correlation-id'], 'GET', correctedPath);
                const executionContext = new ExecutionContext_1.ExecutionContext(this.logger, this.apiName, this.config, String(req.headers['x-correlation-id']), String(req.headers['x-app-version']));
                // Execute the GET
                delegate.do(req, userContext, executionContext).then((stream) => {
                    // Add any additional configured headers
                    if (options && options.contentType)
                        res.header('Content-Type', options.contentType);
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
                    this.logger.compute(req.headers['x-correlation-id'], err, 'error');
                    // If the err is a {code: 400, message: '...'}, then it's a validation error
                    if (err != null && err.code == '400')
                        res.status(400).type('application/json').send(err);
                    // Failure
                    else
                        res.status(500).type('application/json').send(err);
                });
            });
        });
    }
    /**
     * Adds a path that support uploading files
     *  - path:     the path as expected by express. E.g. '/upload'
     */
    fileUploadPath(path, delegate, options) {
        // If a basepath is defined, prepend it to the path
        // Make sure that the basePath does not end with "/". If it does remove it. 
        const correctedPath = (this.options.basePath && (!options || !options.ignoreBasePath)) ? this.options.basePath.replace(/\/$/, '').trim() + path : path;
        this.app.route(correctedPath).post((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            this.logger.apiIn(req.headers['x-correlation-id'], 'POST', correctedPath);
            // Validating
            const userContext = yield this.validator.validate(req);
            let fstream;
            let filename;
            let filepath;
            let additionalData = {};
            req.pipe(req.busboy);
            req.busboy.on('field', (fieldname, value, metadata) => {
                additionalData[fieldname] = value;
            });
            req.busboy.on('file', (fieldname, file, metadata) => {
                this.logger.compute(req.headers['x-correlation-id'], 'Uploading file ' + metadata.filename, 'info');
                // Define the target dir
                let dir = __dirname + '/app-docs';
                // Save the data 
                filename = metadata.filename;
                filepath = dir + '/' + metadata.filename;
                // Ensure that the dir exists
                fs_extra_1.default.ensureDirSync(dir);
                // Create the file stream
                fstream = fs_extra_1.default.createWriteStream(dir + '/' + metadata.filename);
                // Pipe the file data to the stream
                file.pipe(fstream);
            });
            req.busboy.on("finish", () => {
                const executionContext = new ExecutionContext_1.ExecutionContext(this.logger, this.apiName, this.config, String(req.headers['x-correlation-id']), String(req.headers['x-app-version']));
                delegate.do({
                    query: req.query,
                    params: req.params,
                    headers: req.headers,
                    body: Object.assign({ filepath: filepath, filename: filename }, additionalData)
                }, userContext, executionContext).then((data) => {
                    // Success
                    res.status(200).type('application/json').send(data);
                }, (err) => {
                    // Log
                    this.logger.compute(req.headers['x-correlation-id'], err, 'error');
                    // If the err is a {code: 400, message: '...'}, then it's a validation error
                    if (err != null && err.code == '400')
                        res.status(400).type('application/json').send(err);
                    // Failure
                    else
                        res.status(500).type('application/json').send(err);
                });
            });
        }));
        // Log the added path
        console.log('[' + this.apiName + '] - Successfully added method ' + 'POST' + ' ' + correctedPath);
    }
    /**
     * Add a path to the app.
     * Requires:
     *  - method:   the HTTP method. Can be GET, POST, PUT, DELETE
     *  - path:     the path as expected by express. E.g. '/sessions/:id'
     *  - delegate: the delegate that exposes a do() function. Note that the delegate will always receive the entire req object
     *  - options:  optional options to path
     */
    path(method, path, delegate, options) {
        // If a basepath is defined, prepend it to the path
        // Make sure that the basePath does not end with "/". If it does remove it. 
        const correctedPath = (this.options.basePath && (!options || !options.ignoreBasePath)) ? this.options.basePath.replace(/\/$/, '').trim() + path : path;
        const handleRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const cid = String(req.headers['x-correlation-id']);
            try {
                // Log the fact that a call has been received
                this.logger.apiIn(cid, method, correctedPath);
                // Validating
                const userContext = yield this.validator.validate(req, options);
                const executionContext = new ExecutionContext_1.ExecutionContext(this.logger, this.apiName, this.config, cid, String(req.headers['x-app-version']));
                // Execute the GET
                const data = yield delegate.do(req, userContext, executionContext);
                let contentType = 'application/json';
                let dataToReturn = data;
                res.status(200).type(contentType).send(dataToReturn);
            }
            catch (error) {
                this.logger.compute(cid, `${error}`, "error");
                if (error instanceof Validator_1.ValidationError || error instanceof TotoRuntimeError_1.TotoRuntimeError) {
                    res.status(error.code).type("application/json").send(error);
                }
                else {
                    console.log(error);
                    res.status(500).type('application/json').send(error);
                }
            }
        });
        if (method == "GET")
            this.app.get(correctedPath, handleRequest);
        else if (method == "POST")
            this.app.post(correctedPath, handleRequest);
        else if (method == "PUT")
            this.app.put(correctedPath, handleRequest);
        else if (method == "DELETE")
            this.app.delete(correctedPath, handleRequest);
        else
            this.app.get(correctedPath, handleRequest);
        // Log the added path
        console.log('[' + this.apiName + '] - Successfully added method ' + method + ' ' + correctedPath);
    }
    /**
     * Starts the ExpressJS app by listening on the standard port defined for Toto microservices
     */
    listen() {
        if (!this.validator) {
            console.info("[" + this.apiName + "] - Waiting for the configuration to load...");
            setTimeout(() => { this.listen(); }, 300);
            return;
        }
        this.app.listen(8080, () => {
            console.info('[' + this.apiName + '] - Microservice up and running');
        });
    }
}
exports.TotoAPIController = TotoAPIController;
