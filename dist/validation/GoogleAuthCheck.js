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
exports.googleAuthCheck = void 0;
const AuthProviders_1 = require("../model/AuthProviders");
const { OAuth2Client } = require('google-auth-library');
const decodeJWT = (token) => {
    if (token !== null || token !== undefined) {
        const base64String = token.split(`.`)[1];
        const decodedValue = JSON.parse(Buffer.from(base64String, `base64`).toString(`ascii`));
        return decodedValue;
    }
    return null;
};
function googleAuthCheck(cid, authorizationHeader, expectedAudience, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = authorizationHeader ? String(authorizationHeader).substring('Bearer'.length + 1) : null;
        const client = new OAuth2Client(expectedAudience);
        const decodedToken = decodeJWT(token);
        // Useful for debugging audience-related issues
        if (decodedToken.aud != expectedAudience) {
            logger.compute(cid, `Payload Audience: ${decodedToken.aud}`, "error");
            logger.compute(cid, `Expected Audience: ${expectedAudience}`, "error");
        }
        const ticket = yield client.verifyIdToken({ idToken: token, audience: expectedAudience });
        let payload = ticket.getPayload();
        return {
            userId: payload.sub,
            email: payload.email,
            authProvider: AuthProviders_1.AUTH_PROVIDERS.google
        };
    });
}
exports.googleAuthCheck = googleAuthCheck;
