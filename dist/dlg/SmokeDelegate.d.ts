import { Request } from "express";
import { ExecutionContext } from "../model/ExecutionContext";
import { TotoDelegate } from "../model/TotoDelegate";
import { UserContext } from "../model/UserContext";
export declare class SmokeDelegate implements TotoDelegate {
    do(req: Request, userContext: UserContext | undefined, execContext: ExecutionContext): Promise<SmokeResponse>;
}
export interface SmokeResponse {
    api: string;
    status: string;
}
