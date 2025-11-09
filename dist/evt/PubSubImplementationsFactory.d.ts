import { Request } from "express";
import { Logger, TotoControllerConfig } from "../TotoAPIController";
import { APubSubImplementation } from "./PubSubImplementation";
/**
 *
 */
export declare class PubSubImplementationsFactory {
    protected config: TotoControllerConfig;
    protected logger: Logger;
    private registeredImplementations;
    constructor(config: TotoControllerConfig, logger: Logger);
    /**
     * Registers a new PubSub implementation to be used in the Toto API Controller.
     *
     * @param impl an implementation of the APubSubImplementation interface
     */
    registerImplementation(impl: APubSubImplementation): void;
    getPubSubImplementation(req: Request): APubSubImplementation;
}
