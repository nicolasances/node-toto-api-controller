export declare class Logger {
    apiName: string;
    constructor(apiName: string);
    /**
     * This method logs an incoming call to an API path
     */
    apiIn(correlationId: string | string[] | undefined, method: string, path: string, msgId?: string): void;
    /**
     * This method logs an outgoing call to an API
     */
    apiOut(correlationId: string | string[] | undefined, api: string, method: string, path: string, msgId?: string): void;
    /**
    * This method logs an incoming message received from a topic
    */
    eventIn(correlationId: string | string[] | undefined, topic: string, msgId?: string): void;
    /**
    * This method logs an outgoing message sent to a topic
    */
    eventOut(correlationId: string | string[] | undefined, topic: string, msgId?: string): void;
    /**
     * This method logs a generic message
     * Log level can be 'info', 'debug', 'error', 'warn'
     */
    compute(correlationId: string | string[] | undefined, message: string, logLevel?: string): void;
}
