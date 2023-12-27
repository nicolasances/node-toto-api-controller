import { ValidatorProps } from "../model/ValidatorProps";
import { CustomAuthVerifier } from "../model/CustomAuthVerifier";
import { Request } from "express";
import { UserContext } from "../model/UserContext";
import { TotoControllerConfig } from "../model/TotoControllerConfig";
import { Logger } from "../logger/TotoLogger";
/**
 * Base Validator for HTTP Requests
 */
export declare class Validator {
    props: ValidatorProps;
    logger: Logger;
    customAuthVerifier?: CustomAuthVerifier;
    config: TotoControllerConfig;
    /**
     *
     * @param {object} props Propertiess
     * @param {object} logger the toto logger
     * @param {object} customAuthVerifier a custom auth verifier
     */
    constructor(config: TotoControllerConfig, logger: Logger);
    /**
     * Validates the provided request
     * @param req Request the Express request
     * @returns a Promise
     */
    validate(req: Request): Promise<UserContext | undefined>;
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
export declare class ConfigMock implements TotoControllerConfig {
    load(): Promise<any>;
    getCustomAuthVerifier(): CustomAuthVerifier | undefined;
    getProps(): ValidatorProps;
    getExpectedAudience(): string;
}
