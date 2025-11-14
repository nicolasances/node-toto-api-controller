import { TotoControllerConfig, Logger } from "../TotoAPIController";
export declare class TotoRegistryAPI {
    private config;
    logger: Logger;
    constructor(config: TotoControllerConfig);
    /**
     * Registers a new API with the Toto API Registry
     *
     * @param request the api to register
     * @returns the registration response
     */
    registerAPI(request: RegisterAPIRequest): Promise<RegisterAPIResponse>;
    getAPIs(): Promise<GetAPIsResponse>;
}
export interface GetAPIsResponse {
    apis: APIEndpoint[];
}
export interface APIEndpoint {
    apiName: string;
    endpointURL: string;
}
export interface RegisterAPIResponse {
    inserted: boolean;
    updated: boolean;
    insertedId: string;
}
export interface RegisterAPIRequest {
    apiName: string;
    endpointURL?: string;
    hyperscaler?: 'aws' | 'gcp' | 'local';
    basePath?: string;
}
