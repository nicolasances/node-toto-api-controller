import { Logger } from "../logger/TotoLogger";
import { TotoControllerConfig } from "./TotoControllerConfig";
export declare class ExecutionContext {
    logger: Logger;
    cid?: string;
    appVersion?: string;
    apiName: string;
    config: TotoControllerConfig;
    constructor(logger: Logger, apiName: string, config: TotoControllerConfig, cid?: string, appVersion?: string);
}
