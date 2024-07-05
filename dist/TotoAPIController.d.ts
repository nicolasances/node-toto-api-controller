import { Express } from 'express';
import { Logger } from './logger/TotoLogger';
import { TotoControllerConfig } from './model/TotoControllerConfig';
import { Validator } from './validation/Validator';
import { TotoDelegate } from './model/TotoDelegate';
import { TotoPathOptions } from './model/TotoPathOptions';
export declare class TotoControllerOptions {
    debugMode: boolean;
}
/**
 * This is an API controller to Toto APIs
 * It provides all the methods to create an API and it's methods & paths, to create the documentation automatically, etc.
 * Provides the following default paths:
 * '/'            : this is the default SMOKE (health check) path
 * '/publishes'   : this is the path that can be used to retrieve the list of topics that this API publishes events to
 */
export declare class TotoAPIController {
    app: Express;
    apiName: string;
    logger: Logger;
    validator: Validator;
    config: TotoControllerConfig;
    options: TotoControllerOptions;
    /**
     * The constructor requires the express app
     * Requires:
     * - apiName              : (mandatory) - the name of the api (e.g. expenses)
     * - config               : (mandatory) - a TotoControllerConfig instance
     */
    constructor(apiName: string, config: TotoControllerConfig, options?: TotoControllerOptions);
    init(): Promise<void>;
    /**
     * This method will register the specified path to allow access to the static content in the specified folder
     * e.g. staticContent('/img', '/app/img')
     */
    staticContent(path: string, folder: string): void;
    /**
     *
     * @param {string} path the path to which this API is reachable
     * @param {function} delegate the delegate that will handle this call
     * @param {object} options options to configure this path:
     *  - contentType: (OPT, default null) provide the Content-Type header to the response
     */
    streamGET(path: string, delegate: TotoDelegate, options: TotoPathOptions): void;
    /**
     * Adds a path that support uploading files
     *  - path:     the path as expected by express. E.g. '/upload'
     */
    fileUploadPath(path: string, delegate: TotoDelegate): void;
    /**
     * Add a path to the app.
     * Requires:
     *  - method:   the HTTP method. Can be GET, POST, PUT, DELETE
     *  - path:     the path as expected by express. E.g. '/sessions/:id'
     *  - delegate: the delegate that exposes a do() function. Note that the delegate will always receive the entire req object
     *  - options:  optional options to path
     */
    path(method: string, path: string, delegate: TotoDelegate, options?: TotoPathOptions): void;
    /**
     * Starts the ExpressJS app by listening on the standard port defined for Toto microservices
     */
    listen(): void;
}
