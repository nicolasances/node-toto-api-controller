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
exports.googleAuthCheck = googleAuthCheck;
const AuthProviders_1 = require("../model/AuthProviders");
const TokenUtil_1 = require("../util/TokenUtil");
const { OAuth2Client } = require('google-auth-library');
function googleAuthCheck(cid_1, authorizationHeader_1, expectedAudience_1, logger_1) {
    return __awaiter(this, arguments, void 0, function* (cid, authorizationHeader, expectedAudience, logger, debugMode = false) {
        const token = (0, TokenUtil_1.extractTokenFromAuthHeader)(authorizationHeader);
        const client = new OAuth2Client(expectedAudience);
        const decodedToken = (0, TokenUtil_1.decodeJWT)(token);
        if (debugMode === true)
            logger.compute(cid, `[Google Auth Check Debug] - Decoded token: [${JSON.stringify(decodedToken)}]`);
        // Useful for debugging audience-related issues
        if (decodedToken.aud != expectedAudience) {
            logger.compute(cid, `Payload Audience: ${decodedToken.aud}`, "error");
            logger.compute(cid, `Expected Audience: ${expectedAudience}`, "error");
        }
        const ticket = yield client.verifyIdToken({ idToken: token, audience: expectedAudience });
        let payload = ticket.getPayload();
        if (debugMode === true)
            logger.compute(cid, `[Google Auth Check Debug] - Token Verification Ticked payload: [${JSON.stringify(payload)}]`);
        return {
            userId: payload.sub,
            email: payload.email,
            authProvider: AuthProviders_1.AUTH_PROVIDERS.google
        };
    });
}
