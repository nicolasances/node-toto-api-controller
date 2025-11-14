"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotoAPIRequest = exports.TotoAPI = void 0;
const request_1 = __importDefault(require("request"));
const uuid_1 = require("uuid");
const TotoAPIController_1 = require("../TotoAPIController");
class TotoAPI {
    constructor(apiName, config, authToken) {
        this.authToken = authToken || (0, TotoAPIController_1.newTotoServiceToken)(config);
        this.apiName = apiName;
        this.config = config;
    }
    get(request, ResponseClass) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call("GET", request, ResponseClass);
        });
    }
    post(request, ResponseClass) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call("POST", request, ResponseClass);
        });
    }
    put(request, ResponseClass) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call("PUT", request, ResponseClass);
        });
    }
    delete(request, ResponseClass) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call("DELETE", request, ResponseClass);
        });
    }
    /**
     * Calls the specified endpoint
     *
     * @param request the request to send
     * @returns the response in JSON
     */
    call(method, request, ResponseClass) {
        return __awaiter(this, void 0, void 0, function* () {
            const logger = this.config.logger;
            const endpoint = yield TotoAPIController_1.RegistryCache.getInstance().getEndpoint(this.apiName);
            if (!endpoint || !endpoint.endpointURL) {
                logger === null || logger === void 0 ? void 0 : logger.compute(request.cid, `TotoAPI Error: Unable to find endpoint for API [${this.apiName}]`, "error");
                throw new TotoAPIController_1.TotoRuntimeError(500, `TotoAPI Error: Unable to find endpoint for API [${this.apiName}]`);
            }
            return new Promise((success, failure) => {
                (0, request_1.default)({
                    uri: `${endpoint.endpointURL}${request.path}`,
                    method: method,
                    headers: {
                        'x-correlation-id': request.cid,
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request.body)
                }, (err, resp, body) => {
                    handleResponse(err, resp, body, ResponseClass).then(success).catch(failure);
                });
            });
        });
    }
}
exports.TotoAPI = TotoAPI;
class TotoAPIRequest {
    constructor(path, body, cid) {
        this.path = path;
        this.cid = cid || (0, uuid_1.v4)();
        this.body = body;
        // If the path does not start with a '/', add it
        if (!this.path.startsWith('/')) {
            this.path = `/${this.path}`;
        }
    }
}
exports.TotoAPIRequest = TotoAPIRequest;
/**
 * Handle the response from an HTTP request, taking care of parsing the body and handling errors.
 *
 * @param err
 * @param resp
 * @param body
 * @param ResponseClass the class constructor with fromParsedHTTPResponseBody method
 * @returns
 */
function handleResponse(err, resp, body, ResponseClass) {
    return __awaiter(this, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            throw new TotoAPIController_1.TotoRuntimeError(500, `HTTP Request Error: ${err}`);
        }
        // Parse the output
        try {
            const parsedBody = parseBody(body);
            return ResponseClass.fromParsedHTTPResponseBody(parsedBody);
        }
        catch (error) {
            if (error instanceof TotoAPIController_1.TotoRuntimeError)
                throw error;
            console.log(body);
            throw new TotoAPIController_1.TotoRuntimeError(500, `HTTP Response Error: ${error}`);
        }
    });
}
function parseBody(body) {
    try {
        return JSON.parse(body);
    }
    catch (error) {
        console.log(body);
        throw new TotoAPIController_1.TotoRuntimeError(500, `JSON Parse Error. Invalid Response Body: ${body}`);
    }
}
