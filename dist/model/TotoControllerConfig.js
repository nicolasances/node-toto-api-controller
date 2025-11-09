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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotoControllerConfig = void 0;
const TotoAPIController_1 = require("../TotoAPIController");
class TotoControllerConfig {
    constructor(configuration) {
        var _a;
        this.hyperscaler = process.env.HYPERSCALER == 'aws' ? 'aws' : (process.env.HYPERSCALER == 'gcp' ? 'gcp' : 'local');
        let env = process.env.HYPERSCALER == 'aws' ? ((_a = process.env.ENVIRONMENT) !== null && _a !== void 0 ? _a : 'dev') : process.env.GCP_PID;
        if (!env)
            env = 'dev';
        this.env = env;
        this.configuration = configuration;
    }
    /**
     * Loads the configurations and returns a Promise when done
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let promises = [];
            const secretsManager = new TotoAPIController_1.SecretsManager(this.hyperscaler == 'local' ? 'gcp' : this.hyperscaler, this.env, this.logger); // Use GCP Secrets Manager when local
            promises.push(secretsManager.getSecret('mongo-host').then((value) => {
                this.mongoHost = value;
            }));
            promises.push(secretsManager.getSecret('jwt-signing-key').then((value) => {
                this.jwtSigningKey = value;
            }));
            promises.push(secretsManager.getSecret('toto-expected-audience').then((value) => {
                this.expectedAudience = value;
            }));
            yield Promise.all(promises);
        });
    }
    /**
     * Return the JWT Token Signing Key for custom tokens
     */
    getSigningKey() {
        return this.jwtSigningKey;
    }
    /**
     * Returns the expected audience.
     * The expected audience is used when verifying the Authorization's header Bearer JWT token.
     * The audience is extracted from the token and compared with the expected audience, to make sure
     * that the token was issued for the correct purpose (audience).
     */
    getExpectedAudience() {
        return String(this.expectedAudience);
    }
    /**
     * Returns the name of the API (service, microservice) managed by this controller.
     */
    getAPIName() {
        return this.configuration.apiName;
    }
}
exports.TotoControllerConfig = TotoControllerConfig;
