"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubImplementationsFactory = void 0;
const TotoAPIController_1 = require("../TotoAPIController");
/**
 *
 */
class PubSubImplementationsFactory {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.registeredImplementations = [];
    }
    /**
     * Registers a new PubSub implementation to be used in the Toto API Controller.
     *
     * @param impl an implementation of the APubSubImplementation interface
     */
    registerImplementation(impl) {
        this.registeredImplementations.push(impl);
    }
    getPubSubImplementation(req) {
        const implementations = this.registeredImplementations.filter(impl => impl.getRequestValidator().isRequestRecognized(req));
        if (implementations.length == 0)
            throw new TotoAPIController_1.TotoRuntimeError(500, `No PubSub implementation found for the received request. Request body: ${JSON.stringify(req.body)}`);
        return implementations[0];
    }
}
exports.PubSubImplementationsFactory = PubSubImplementationsFactory;
