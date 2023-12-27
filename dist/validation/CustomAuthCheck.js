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
exports.customAuthCheck = void 0;
/**
 * This function allows extensions on the Toto authorization validator, by supporting custom authProvider and custom ways to verify authorization
 * @param {string} cid correlation id
 * @param {string} authorizationHeader Authorization HTTP header
 * @param {object} authorizationVerifier authorization verifier. It's an object that must have a function called verifyIdToken()
 * @param {object} logger the toto logger to use
 * @returns
 */
function customAuthCheck(cid, authorizationHeader, authorizationVerifier, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        let token = String(authorizationHeader).substring('Bearer'.length + 1);
        try {
            const result = yield authorizationVerifier.verifyIdToken({ idToken: token });
            return {
                userId: result.sub,
                email: result.email,
                authProvider: result.authProvider
            };
        }
        catch (error) {
            logger.compute(cid, "Invalid Authorization Token", "error");
            throw { code: 401, message: `Invalid Authorization Token [${token}]` };
        }
    });
}
exports.customAuthCheck = customAuthCheck;
