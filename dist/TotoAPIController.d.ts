import { Express } from 'express';
import { Logger } from './logger/TotoLogger';
import { TotoControllerConfig } from './model/TotoControllerConfig';
import { Validator } from './validation/Validator';
import { TotoDelegate } from './model/TotoDelegate';
import { TotoPathOptions } from './model/TotoPathOptions';
import { ITotoPubSubEventHandler } from './evt/TotoPubSubEventHandler';
import { PubSubImplementationsFactory } from './evt/PubSubImplementationsFactory';
import { APubSubImplementation } from './evt/PubSubImplementation';
export { APubSubImplementation, APubSubRequestValidator } from './evt/PubSubImplementation';
export { PubSubImplementationsFactory } from './evt/PubSubImplementationsFactory';
export { TotoMessage } from './evt/TotoMessage';
export { ITotoPubSubEventHandler } from './evt/TotoPubSubEventHandler';
export { Logger } from './logger/TotoLogger';
export { AUTH_PROVIDERS } from './model/AuthProviders';
export { ExecutionContext } from './model/ExecutionContext';
export { TotoControllerConfig, ConfigurationData } from './model/TotoControllerConfig';
export { FakeRequest, TotoDelegate } from './model/TotoDelegate';
export { TotoPathOptions } from './model/TotoPathOptions';
export { TotoRuntimeError } from './model/TotoRuntimeError';
export { UserContext } from './model/UserContext';
export { ValidatorProps } from './model/ValidatorProps';
export { correlationId } from './util/CorrelationId';
export { SecretsManager } from './util/CrossCloudSecret';
export { basicallyHandleError } from './util/ErrorUtil';
export { GCPPubSubRequestValidator } from './evt/impl/gcp/GCPPubSubRequestValidator';
export { SNSRequestValidator } from './evt/impl/aws/SNSRequestValidator';
export { googleAuthCheck } from './validation/GoogleAuthCheck';
export { ConfigMock, LazyValidator, ValidationError, Validator } from './validation/Validator';
export declare class TotoControllerOptions {
    debugMode?: boolean;
    basePath?: string;
    port?: number;
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
    pubSubImplementationsFactory: PubSubImplementationsFactory;
    /**
     * The constructor requires the express app
     * Requires:
     * - apiName              : (mandatory) - the name of the api (e.g. expenses)
     * - config               : (mandatory) - a TotoControllerConfig instance
     */
    constructor(config: TotoControllerConfig, options?: TotoControllerOptions);
    /**
     * Registers a new PubSub implementation to be used in the Toto API Controller.
     *
     * @param impl an implementation of APubSubImplementation
     */
    registerPubSubImplementation(impl: APubSubImplementation): void;
    init(): Promise<void>;
    /**
     * This method will register the specified path to allow access to the static content in the specified folder
     * e.g. staticContent('/img', '/app/img')
     */
    staticContent(path: string, folder: string, options?: TotoPathOptions): void;
    /**
     *
     * @param {string} path the path to which this API is reachable
     * @param {function} delegate the delegate that will handle this call
     * @param {object} options options to configure this path:
     *  - contentType: (OPT, default null) provide the Content-Type header to the response
     */
    streamGET(path: string, delegate: TotoDelegate, options?: TotoPathOptions): void;
    /**
     * Adds a path that support uploading files
     *  - path:     the path as expected by express. E.g. '/upload'
     */
    fileUploadPath(path: string, delegate: TotoDelegate, options?: TotoPathOptions): void;
    /**
     * Registers a PubSub event handler for the specified resource.
     * PubSub here is meant as the pattern not as the GCP offering. This should support any PubSub implementation (e.g. AWS SNS, Azure Service Bus, GCP PubSub, etc.)
     *
     * @param resource the name of the resource that the handler will listen to.
     * Resources are the REST resource that this handler will manage events on.
     * For example: resource "payment" will manage all events related to the payment resource. E.g.: new payment, deleted payment, updated payment, etc..
     * IT IS NOT the name of the pubsub topic!
     *
     * @param handler the delegate that will handle the events for this resource
     */
    registerPubSubEventHandler(resource: string, handler: ITotoPubSubEventHandler, options?: TotoPathOptions): void;
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
