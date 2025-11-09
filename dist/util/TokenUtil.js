"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthProvider = exports.extractTokenFromAuthHeader = exports.decodeJWT = void 0;
const TotoAPIController_1 = require("../TotoAPIController");
/**
 * Extracts the Bearer token from the HTTP Authorization header and decodes it
 * @param authorizationHeader HTTP Auth header
 * @returns a decoded JWT token as a json object
 */
const decodeJWT = (authorizationHeader) => {
    const token = String(authorizationHeader).substring('Bearer'.length + 1);
    if (token !== null || token !== undefined) {
        const base64String = token.split(`.`)[1];
        const decodedValue = JSON.parse(Buffer.from(base64String, `base64`).toString(`ascii`));
        return decodedValue;
    }
    return null;
};
exports.decodeJWT = decodeJWT;
const extractTokenFromAuthHeader = (authorizationHeader) => {
    return String(authorizationHeader).substring('Bearer'.length + 1);
};
exports.extractTokenFromAuthHeader = extractTokenFromAuthHeader;
/**
 * Finds out what the Auth Provider of the JWT token is.
 * For tokens created by toto-auth, the auth provider is provided in the JWT token as a specific "authProvider" field.
 * For tokens created by other IDPs, look at the iss field of the JWT Token
 *
 * @param tokenJson the JWT token as a json object
 * @returns the auth provider based on the JWT token
 */
const getAuthProvider = (tokenJson) => {
    if (tokenJson.authProvider)
        return tokenJson.authProvider;
    if (tokenJson.iss && (tokenJson.iss.indexOf("accounts.google.com") > -1))
        return TotoAPIController_1.AUTH_PROVIDERS.google;
    return "custom";
};
exports.getAuthProvider = getAuthProvider;
