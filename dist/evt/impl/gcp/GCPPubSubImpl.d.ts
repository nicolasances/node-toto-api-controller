import { Request } from "express";
import { APubSubImplementation, APubSubRequestFilter, APubSubRequestValidator } from "../../PubSubImplementation";
import { TotoMessage } from "../../TotoMessage";
export declare class GCPPubSubImpl extends APubSubImplementation {
    filter(req: Request): APubSubRequestFilter | null;
    getRequestValidator(): APubSubRequestValidator;
    convertMessage(req: Request): TotoMessage;
}
