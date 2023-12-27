export declare class TotoRuntimeError extends Error {
    code: number;
    message: string;
    subcode: string | undefined;
    constructor(code: number, message: string, subcode?: string);
}
