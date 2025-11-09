import { Request } from "express";
import { APubSubRequestValidator } from "../../PubSubImplementation";
/**
 * Validator for HTTP Requests made by Google Cloud PubSub push infrastructure.
 *
 * Implementation notes:
 * - GCP PubSub supports adding HTTP Headers (e.g. Authorization). Therefore, this validator can validate the request based on JWT tokens.
 */
export declare class GCPPubSubRequestValidator extends APubSubRequestValidator {
    isRequestRecognized(req: Request): boolean;
    isRequestAuthorized(req: Request): Promise<boolean>;
}
