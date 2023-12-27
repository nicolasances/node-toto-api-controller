"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class Logger {
    constructor(apiName) {
        this.apiName = apiName;
    }
    /**
     * This method logs an incoming call to an API path
     */
    apiIn(correlationId, method, path, msgId) {
        let ts = (0, moment_timezone_1.default)().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');
        console.info(`[${ts}] - [${correlationId}] - [${this.apiName}] - [api-in] - [info] - Recevied HTTP call [${method}] ${path}`);
    }
    /**
     * This method logs an outgoing call to an API
     */
    apiOut(correlationId, api, method, path, msgId) {
        let ts = (0, moment_timezone_1.default)().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');
        console.info(`[${ts}] - [${correlationId}] - [${this.apiName}] - [api-out] - [info] - Executing HTTP call to api [${api}] [${method}] ${path}`);
    }
    /**
    * This method logs an incoming message received from a topic
    */
    eventIn(correlationId, topic, msgId) {
        let ts = (0, moment_timezone_1.default)().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');
        console.info(`[${ts}] - [${correlationId}] - [${this.apiName}] - [event-in] - [info] - Recevied event from topic [${topic}]`);
    }
    /**
    * This method logs an outgoing message sent to a topic
    */
    eventOut(correlationId, topic, msgId) {
        let ts = (0, moment_timezone_1.default)().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');
        console.info(`[${ts}] - [${correlationId}] - [${this.apiName}] - [event-out] - [info] - Publishing event to topic [${topic}]`);
    }
    /**
     * This method logs a generic message
     * Log level can be 'info', 'debug', 'error', 'warn'
     */
    compute(correlationId, message, logLevel) {
        let ts = (0, moment_timezone_1.default)().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');
        logLevel = logLevel !== null && logLevel !== void 0 ? logLevel : "info";
        if (logLevel == 'info')
            console.info(`[${ts}] - [${correlationId}] - [${this.apiName}] - [info] - ${message}`);
        else if (logLevel == 'error')
            console.error(`[${ts}] - [${correlationId}] - [${this.apiName}] - [info] - ${message}`);
        else if (logLevel == 'warn')
            console.warn(`[${ts}] - [${correlationId}] - [${this.apiName}] - [info] - ${message}`);
        else
            console.info(`[${ts}] - [${correlationId}] - [${this.apiName}] - [info] - ${message}`);
    }
}
exports.Logger = Logger;
