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
exports.SecretsManager = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
/**
 * This class is a utility class to extract secrets from different clouds.
 * It supports:
 * - GCP Secret Manager
 * - AWS Secrets Manager
 */
class SecretsManager {
    constructor(provider, environment, logger) {
        /**
         * This function retrieves a secret from AWS Secrets Manager.
         * Credentials are assumed to be provided by the environment (e.g. EC2 role, ECS role, etc)
         *
         * @param environment the environment where the code is running (e.g. dev, test)
         * @param secretName the name of the secret in AWS Secrets Manager.
         */
        this.getSecretFromAWS = (environment, secretName) => __awaiter(this, void 0, void 0, function* () {
            const fullSecretName = `${environment}/${secretName}`;
            this.logger.compute("", `Retrieving secret ${fullSecretName} from AWS Secrets Manager`);
            const client = new client_secrets_manager_1.SecretsManager({ region: process.env.AWS_REGION || 'eu-north-1' });
            const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: fullSecretName });
            const response = yield client.send(command);
            if (!response || !response.SecretString)
                throw new Error(`No secret found for name ${fullSecretName}`);
            return response.SecretString;
        });
        /**
         * This function retrieves a secret from GCP Secret Manager.
         * Credentials are assumed to be provided by the environment (e.g. GCE, GKE, Cloud Run, etc)
         *
         * @param environment the environment where the code is running (e.g. dev, test). In GCP that is the GCP project ID!
         * @param secretName the name of the secret in GCP Secret Manager
         */
        this.getSecretFromGCP = (environment, secretName) => __awaiter(this, void 0, void 0, function* () {
            this.logger.compute("", `Retrieving secret ${secretName} from GCP Secret Manager in project ${environment}`);
            const client = new secret_manager_1.SecretManagerServiceClient();
            const [version] = yield client.accessSecretVersion({ name: `projects/${environment}/secrets/${secretName}/versions/latest` });
            if (!version || !version.payload || !version.payload.data)
                throw new Error(`No secret found for name ${secretName}`);
            return version.payload.data.toString();
        });
        this.provider = provider;
        this.environment = environment;
        this.logger = logger;
    }
    getSecret(secretName) {
        if (this.provider == "aws") {
            return this.getSecretFromAWS(this.environment, secretName);
        }
        else {
            return this.getSecretFromGCP(this.environment, secretName);
        }
    }
}
exports.SecretsManager = SecretsManager;
