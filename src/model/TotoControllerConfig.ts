import { RegistryCache } from "../integration/RegistryCache";
import { Logger } from "../logger/TotoLogger";
import { SecretsManager, TotoRuntimeError } from "../TotoAPIController";
import { ValidatorProps } from "./ValidatorProps";

export abstract class TotoControllerConfig {

    configuration: ConfigurationData;
    logger: Logger | undefined;

    hyperscaler: "aws" | "gcp" | "local";
    env: string;
    
    protected mongoHost: string | undefined;
    protected jwtSigningKey: string | undefined;
    protected expectedAudience: string | undefined;
    options: TotoControllerConfigOptions | undefined;
    totoRegistryEndpoint: string | undefined;

    constructor(configuration: ConfigurationData, options?: TotoControllerConfigOptions) {

        this.hyperscaler = process.env.HYPERSCALER as "aws" | "gcp" | "local" ?? options?.defaultHyperscaler ?? "gcp";

        this.env = (this.hyperscaler == 'aws' || this.hyperscaler == 'local') ? (process.env.ENVIRONMENT ?? 'dev') : process.env.GCP_PID ?? 'dev';

        this.configuration = configuration;
        this.options = options;

    }

    /**
     * Loads the configurations and returns a Promise when done
     */
    async load(): Promise<any> {

        let promises = [];

        const secretsManagerLocation = this.hyperscaler == 'local' ? this.options?.defaultSecretsManagerLocation ?? "gcp" : this.hyperscaler;

        const secretsManager = new SecretsManager(secretsManagerLocation, this.env, this.logger!);  // Use GCP Secrets Manager when local

        promises.push(secretsManager.getSecret('mongo-host').then((value) => {
            this.mongoHost = value;
        }));
        promises.push(secretsManager.getSecret('jwt-signing-key').then((value) => {
            this.jwtSigningKey = value;
        }));
        promises.push(secretsManager.getSecret('toto-expected-audience').then((value) => {
            this.expectedAudience = value;
        }));
        promises.push(secretsManager.getSecret('toto-registry-endpoint').then((value) => {
            this.totoRegistryEndpoint = value;
        }));

        await Promise.all(promises);

    }

    /**
     * Returns the Validator Properties
     */
    abstract getProps(): ValidatorProps

    /**
     * Return the JWT Token Signing Key for custom tokens
     */
    getSigningKey(): string {
        return this.jwtSigningKey!;
    }

    /**
     * Returns the expected audience. 
     * The expected audience is used when verifying the Authorization's header Bearer JWT token.
     * The audience is extracted from the token and compared with the expected audience, to make sure 
     * that the token was issued for the correct purpose (audience).
     */
    getExpectedAudience(): string {
        return String(this.expectedAudience)
    }

    /**
     * Returns the name of the API (service, microservice) managed by this controller.
     */
    getAPIName(): string {
        return this.configuration.apiName;
    }

    getTotoRegistryEndpoint(): string {
        return String(this.totoRegistryEndpoint);
    }

}

export interface ConfigurationData {
    apiName: string;
}

export class TotoControllerConfigOptions {
    defaultHyperscaler: "aws" | "gcp" = "gcp";
    defaultSecretsManagerLocation: "aws" | "gcp" = "gcp";
}