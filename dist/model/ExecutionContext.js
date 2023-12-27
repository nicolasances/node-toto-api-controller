"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContext = void 0;
class ExecutionContext {
    constructor(logger, apiName, config, cid, appVersion) {
        this.apiName = apiName;
        this.logger = logger;
        this.cid = cid;
        this.appVersion = appVersion;
        this.config = config;
    }
}
exports.ExecutionContext = ExecutionContext;
