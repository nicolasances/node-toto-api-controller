import { Request } from "express";
import { APubSubImplementation, APubSubRequestFilter, APubSubRequestValidator } from "../../PubSubImplementation";
import { TotoMessage } from "../../TotoMessage";
export declare class SNSImpl extends APubSubImplementation {
    getRequestValidator(): APubSubRequestValidator;
    filter(req: Request): APubSubRequestFilter | null;
    convertMessage(req: Request): TotoMessage;
}
