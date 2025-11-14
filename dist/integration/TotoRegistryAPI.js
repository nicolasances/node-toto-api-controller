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
exports.TotoRegistryAPI = void 0;
const request_1 = __importDefault(require("request"));
const TotoAPIController_1 = require("../TotoAPIController");
const uuid_1 = require("uuid");
class TotoRegistryAPI {
    constructor(config) {
        this.config = config;
        this.logger = config.logger;
    }
    /**
     * Registers a new API with the Toto API Registry
     *
     * @param request the api to register
     * @returns the registration response
     */
    registerAPI(request) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.compute("", `Registering API [ ${request.apiName} ] with Toto Registry at [ ${this.config.getTotoRegistryEndpoint()} ].`, "info");
            return new Promise((success, failure) => {
                (0, request_1.default)({
                    uri: `${this.config.getTotoRegistryEndpoint()}/apis`,
                    method: 'POST',
                    headers: {
                        'x-correlation-id': (0, uuid_1.v4)(),
                        'Authorization': "Bearer " + (0, TotoAPIController_1.newTotoServiceToken)(this.config),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                }, (err, resp, body) => {
                    handleResponse(err, resp, body).then(success).catch(failure);
                });
            });
        });
    }
    getAPIs() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((success, failure) => {
                (0, request_1.default)({
                    uri: `${this.config.getTotoRegistryEndpoint()}/apis`,
                    method: 'GET',
                    headers: {
                        'x-correlation-id': (0, uuid_1.v4)(),
                        'Authorization': "Bearer " + (0, TotoAPIController_1.newTotoServiceToken)(this.config),
                        'Content-Type': 'application/json'
                    }
                }, (err, resp, body) => {
                    handleResponse(err, resp, body).then(success).catch(failure);
                });
            });
        });
    }
}
exports.TotoRegistryAPI = TotoRegistryAPI;
/**
 * Handle the response from an HTTP request, taking care of parsing the body and handling errors.
 *
 * @param err
 * @param resp
 * @param body
 * @returns
 */
function handleResponse(err, resp, body) {
    return __awaiter(this, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            throw new TotoAPIController_1.TotoRuntimeError(500, `HTTP Request Error: ${err}`);
        }
        // Parse the output
        try {
            const parsedBody = parseBody(body);
            return parsedBody;
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
