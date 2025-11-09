import { ValidatorProps } from "../model/ValidatorProps";
import { Request } from "express";
import { UserContext } from "../model/UserContext";
import { TotoControllerConfig } from "../model/TotoControllerConfig";
import { TotoPathOptions } from "../model/TotoPathOptions";
import { Logger } from "../logger/TotoLogger";
/**
 * Base Validator for HTTP Requests
 */
export declare class Validator {
    props: ValidatorProps;
    logger: Logger;
    config: TotoControllerConfig;
    debugMode: boolean;
    /**
     *
     * @param {object} props Propertiess
     * @param {object} logger the toto logger
     */
    constructor(config: TotoControllerConfig, logger: Logger, debugMode?: boolean);
    /**
     * Validates the provided request
     * @param req Request the Express request
     * @returns a Promise
     */
    validate(req: Request, options?: TotoPathOptions): Promise<UserContext | undefined>;
}
export declare class ValidationError extends Error {
    code: number;
    message: string;
    subcode: string | undefined;
    constructor(code: number, message: string, subcode?: string);
}
export declare class LazyValidator extends Validator {
    constructor();
}
export declare class ConfigMock extends TotoControllerConfig {
    constructor();
    getSigningKey(): string;
    load(): Promise<any>;
    getProps(): ValidatorProps;
    getExpectedAudience(): string;
}
