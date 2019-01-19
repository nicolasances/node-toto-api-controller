var bodyParser = require("body-parser");

/**
 * This is an API controller to Toto APIs
 * It provides all the methods to create an API and it's methods & paths, to create the documentation automatically, etc.
 */
class TotoAPIController {

  /**
   * The constructor requires the express app
   */
  constructor(apiName, expressApp) {

    this.app = expressApp;
    this.apiName = apiName;

    // Init the paths
    this.paths = [];

    // Initialize the basic Express functionalities
    this.app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
      next();
    });

    this.app.use(bodyParser.json());

    // Add the basic SMOKE api
    this.path('GET', '/', {do: function(req) {
      return new Promise(function(s, f) {
        return s({api: apiName, status: 'running'})
      });
    }});
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
      // Execute the GET
      delegate.do(req).then((data) => {
        // Success
        res.status(200).type('application/json').send(data);
      }, (err) => {
        // Failure
        res.status(500).type('application/json').send(err);
      });
    });
    else if (method == 'POST') this.app.post(path, (req, res) => {
      // Execute the POST
      delegate.do(req).then((data) => {
        // Success
        res.status(201).type('application/json').send(data);
      }, (err) => {
        // Failure
        res.status(500).type('application/json').send(err);
      });
    });
    else if (method == 'DELETE') this.app.delete(path, (req, res) => {
      // Execute the DELETE
      delegate.do(req).then((data) => {
        // Success
        res.status(200).type('application/json').send(data);
      }, (err) => {
        // Failure
        res.status(500).type('application/json').send(err);
      });
    });
    else if (method == 'PUT') this.app.delete(path, (req, res) => {
      // Execute the PUT
      delegate.do(req).then((data) => {
        // Success
        res.status(200).type('application/json').send(data);
      }, (err) => {
        // Failure
        res.status(500).type('application/json').send(err);
      });
    });

    // Log the added path
    console.log('[' + this.apiName + '] - Successfully added method ' + method + ' ' + path);
  }
}

// Export the module
module.exports = TotoAPIController;
