import { TotoControllerConfig } from "../TotoAPIController";
/**
 * Generates a new JWT token for the Toto service.
 *
 * Important: the token represents a service, not a user. The user field is set to the name of the microservice (extracted from the config).
 *
 * @param config the Toto Controller Config
 * @returns a JWT token
 */
export declare function newTotoServiceToken(config: TotoControllerConfig): string;
