import { TotoControllerConfig } from "../TotoAPIController";
export declare class TotoAPI {
    protected apiName: string;
    protected authToken: string;
    protected config: TotoControllerConfig;
    constructor(apiName: string, config: TotoControllerConfig, authToken?: string);
    protected get<T>(request: TotoAPIRequest, ResponseClass: TotoAPIResponseConstructor<T>): Promise<T>;
    protected post<T>(request: TotoAPIRequest, ResponseClass: TotoAPIResponseConstructor<T>): Promise<T>;
    protected put<T>(request: TotoAPIRequest, ResponseClass: TotoAPIResponseConstructor<T>): Promise<T>;
    protected delete<T>(request: TotoAPIRequest, ResponseClass: TotoAPIResponseConstructor<T>): Promise<T>;
    /**
     * Calls the specified endpoint
     *
     * @param request the request to send
     * @returns the response in JSON
     */
    private call;
}
export declare class TotoAPIRequest {
    path: string;
    cid: string;
    body?: any;
    constructor(path: string, body?: any, cid?: string);
}
interface TotoAPIResponseConstructor<T> {
    fromParsedHTTPResponseBody(body: any): T;
}
export {};
