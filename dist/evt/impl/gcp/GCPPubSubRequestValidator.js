"use strict";
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
exports.GCPPubSubRequestValidator = void 0;
const Validator_1 = require("../../../validation/Validator");
const GoogleAuthCheck_1 = require("../../../validation/GoogleAuthCheck");
const PubSubImplementation_1 = require("../../PubSubImplementation");
/**
 * Validator for HTTP Requests made by Google Cloud PubSub push infrastructure.
 *
 * Implementation notes:
 * - GCP PubSub supports adding HTTP Headers (e.g. Authorization). Therefore, this validator can validate the request based on JWT tokens.
 */
class GCPPubSubRequestValidator extends PubSubImplementation_1.APubSubRequestValidator {
    isRequestRecognized(req) {
        // Check if the request body has the typical GCP PubSub message structure
        if (!req.body || typeof req.body !== 'object') {
            return false;
        }
        // GCP PubSub push messages have a 'message' field and a 'subscription' field
        const hasMessage = 'message' in req.body && typeof req.body.message === 'object';
        if (!hasMessage) {
            return false;
        }
        // The message object should contain 'data' and 'messageId' fields
        const message = req.body.message;
        const hasData = 'data' in message;
        return hasData;
    }
    isRequestAuthorized(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Extraction of the headers
            const authorizationHeader = req.get('authorization');
            if (!authorizationHeader)
                throw new Validator_1.ValidationError(401, "No Authorization Header provided");
            const expectedAudience = this.config.getExpectedAudience();
            const googleAuthCheckResult = yield (0, GoogleAuthCheck_1.googleAuthCheck)("", authorizationHeader, expectedAudience, this.logger, false);
            if (googleAuthCheckResult.email)
                return true;
            return false;
        });
    }
}
exports.GCPPubSubRequestValidator = GCPPubSubRequestValidator;
