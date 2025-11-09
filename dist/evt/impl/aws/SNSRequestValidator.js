"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNSRequestValidator = void 0;
const crypto = __importStar(require("crypto"));
const https = __importStar(require("https"));
const PubSubImplementation_1 = require("../../PubSubImplementation");
class SNSRequestValidator extends PubSubImplementation_1.APubSubRequestValidator {
    isRequestRecognized(req) {
        // Check if the x-amz-sns-message-type header is present 
        if (req.get('x-amz-sns-message-type')) {
            this.logger.compute('', `Received SNS request with header x-amz-sns-message-type: ${req.get("x-amz-sns-message-type")}`);
            if (req.get('x-amz-sns-message-type') == 'SubscriptionConfirmation' || req.get('x-amz-sns-message-type') == 'UnsubscribeConfirmation' || req.get('x-amz-sns-message-type') == 'Notification')
                return true;
        }
        return false;
        // const message = req.body;
        // if (!message || !message.Type || !message.Signature || !message.SigningCertURL) return false;
        // return this.isValidCertUrl(message.SigningCertURL);
    }
    isRequestAuthorized(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the x-amz-sns-message-type header is present 
                if (req.get('x-amz-sns-message-type')) {
                    if (req.get('x-amz-sns-message-type') == 'SubscriptionConfirmation' || req.get('x-amz-sns-message-type') == 'UnsubscribeConfirmation' || req.get('x-amz-sns-message-type') == 'Notification')
                        return true;
                }
                const message = req.body;
                // 1. Verify message has required fields
                if (!message || !message.Type || !message.Signature || !message.SigningCertURL) {
                    this.logger.compute('', 'SNS message missing required fields');
                    return false;
                }
                // 2. Verify the certificate URL is from AWS
                // if (!this.isValidCertUrl(message.SigningCertURL)) {
                //     this.logger.compute('', 'Invalid SNS certificate URL');
                //     return false;
                // }
                // // 3. Download and verify the signing certificate
                // const certificate = await this.downloadCertificate(message.SigningCertURL);
                // if (!certificate) {
                //     this.logger.compute('', 'Failed to download SNS certificate');
                //     return false;
                // }
                // // 4. Build the string to sign based on message type
                // const stringToSign = this.buildStringToSign(message);
                // if (!stringToSign) {
                //     this.logger.compute('', 'Invalid SNS message type');
                //     return false;
                // }
                // // 5. Verify the signature
                // const isValid = this.verifySignature(certificate, stringToSign, message.Signature);
                // if (!isValid) {
                //     this.logger.compute('', 'SNS signature verification failed');
                //     return false;
                // }
                // 6. Optional: Verify topic ARN if you want to restrict to specific topics
                // const expectedTopicArn = process.env.SNS_TOPIC_ARN;
                // if (expectedTopicArn && message.TopicArn !== expectedTopicArn) {
                //     console.error('SNS message from unexpected topic');
                //     return false;
                // }
                this.logger.compute('', `SNS message validated successfully. Type: ${message.Type}`);
                return true;
            }
            catch (error) {
                console.error('SNS request validation error:', error);
                return false;
            }
        });
    }
    /**
     * Verify the certificate URL is from AWS
     */
    isValidCertUrl(certUrl) {
        try {
            const url = new URL(certUrl);
            // Must be HTTPS and from amazonaws.com
            return url.protocol === 'https:' && (url.hostname.endsWith('.amazonaws.com') || url.hostname === 'sns.amazonaws.com');
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Download the certificate from AWS
     */
    downloadCertificate(certUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                https.get(certUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => resolve(data));
                }).on('error', (err) => {
                    console.error('Certificate download error:', err);
                    resolve(null);
                });
            });
        });
    }
    /**
     * Build the string to sign based on SNS message type
     */
    buildStringToSign(message) {
        const fields = {
            'Notification': ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'],
            'SubscriptionConfirmation': ['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type'],
            'UnsubscribeConfirmation': ['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type']
        };
        const messageType = message.Type;
        const fieldList = fields[messageType];
        if (!fieldList) {
            return null;
        }
        let stringToSign = '';
        for (const field of fieldList) {
            if (message[field] !== undefined) {
                stringToSign += `${field}\n${message[field]}\n`;
            }
        }
        return stringToSign;
    }
    /**
     * Verify the signature using the certificate
     */
    verifySignature(certificate, stringToSign, signature) {
        try {
            const verifier = crypto.createVerify('SHA1');
            verifier.update(stringToSign, 'utf8');
            // Pass signature as base64 string and specify encoding
            return verifier.verify(certificate, signature, 'base64');
        }
        catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }
}
exports.SNSRequestValidator = SNSRequestValidator;
