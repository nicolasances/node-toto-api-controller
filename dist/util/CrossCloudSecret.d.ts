import { Logger } from '../logger/TotoLogger';
/**
 * This class is a utility class to extract secrets from different clouds.
 * It supports:
 * - GCP Secret Manager
 * - AWS Secrets Manager
 */
export declare class SecretsManager {
    private provider;
    private environment;
    private logger;
    constructor(provider: "aws" | "gcp", environment: string, logger: Logger);
    getSecret(secretName: string): Promise<string>;
    /**
     * This function retrieves a secret from AWS Secrets Manager.
     * Credentials are assumed to be provided by the environment (e.g. EC2 role, ECS role, etc)
     *
     * @param environment the environment where the code is running (e.g. dev, test)
     * @param secretName the name of the secret in AWS Secrets Manager.
     */
    private getSecretFromAWS;
    /**
     * This function retrieves a secret from GCP Secret Manager.
     * Credentials are assumed to be provided by the environment (e.g. GCE, GKE, Cloud Run, etc)
     *
     * @param environment the environment where the code is running (e.g. dev, test). In GCP that is the GCP project ID!
     * @param secretName the name of the secret in GCP Secret Manager
     */
    private getSecretFromGCP;
}
