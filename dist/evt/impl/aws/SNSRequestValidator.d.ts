import { Request } from "express";
import { APubSubRequestValidator } from "../../PubSubImplementation";
export declare class SNSRequestValidator extends APubSubRequestValidator {
    isRequestRecognized(req: Request): boolean;
    isRequestAuthorized(req: Request): Promise<boolean>;
    /**
     * Verify the certificate URL is from AWS
     */
    private isValidCertUrl;
    /**
     * Download the certificate from AWS
     */
    private downloadCertificate;
    /**
     * Build the string to sign based on SNS message type
     */
    private buildStringToSign;
    /**
     * Verify the signature using the certificate
     */
    private verifySignature;
}
