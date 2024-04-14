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
exports.ConfigMock = exports.LazyValidator = exports.ValidationError = exports.Validator = void 0;
const CustomAuthCheck_1 = require("./CustomAuthCheck");
const GoogleAuthCheck_1 = require("./GoogleAuthCheck");
const AuthProviders_1 = require("../model/AuthProviders");
const TotoLogger_1 = require("../logger/TotoLogger");
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
        return AuthProviders_1.AUTH_PROVIDERS.google;
    return "custom";
};
/**
 * Base Validator for HTTP Requests
 */
class Validator {
    /**
     *
     * @param {object} props Propertiess
     * @param {object} logger the toto logger
     * @param {object} customAuthVerifier a custom auth verifier
     */
    constructor(config, logger, debugMode = false) {
        this.props = config.getProps();
        this.logger = logger;
        this.customAuthVerifier = config.getCustomAuthVerifier();
        this.config = config;
        this.debugMode = debugMode;
    }
    /**
     * Validates the provided request
     * @param req Request the Express request
     * @returns a Promise
     */
    validate(req) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Extraction of the headers
            // Authorization & AuthProvider
            let authorizationHeader = (_a = req.headers['authorization']) !== null && _a !== void 0 ? _a : req.headers['Authorization'];
            // Correlation ID 
            let cid = (_b = String(req.headers['x-correlation-id'])) !== null && _b !== void 0 ? _b : "";
            // App Version
            let appVersion = req.headers['x-app-version'];
            // Checking Correlation ID
            if (this.props.noCorrelationId == null || this.props.noCorrelationId == false) {
                if (cid == null)
                    throw new ValidationError(400, "No Correlation ID was provided");
            }
            // Checking minimum app version
            // The minimum app version must be in the format major.minor.patch
            if (this.props.minAppVersion) {
                if (appVersion && appVersion < this.props.minAppVersion)
                    throw new ValidationError(412, "The App Version is not compatible with this API", 'app-version-not-compatible');
            }
            // Checking authorization
            // If the config doesn't say to bypass authorization, look for the Auth header
            if (this.props.noAuth == null || this.props.noAuth == false) {
                if (!authorizationHeader)
                    throw new ValidationError(401, "No Authorization Header provided");
                // Decode the JWT token
                const decodedToken = decodeJWT(String(authorizationHeader));
                // Retrieve the auth provider from the JWT Token
                const authProvider = getAuthProvider(decodedToken);
                if (this.debugMode === true)
                    this.logger.compute(cid, `[Validator Debug] - Auth Provider: [${authProvider}]`);
                // Retrieve the audience that the token will be validated against
                // That is the audience that is expected to be found in the token
                const expectedAudience = this.config.getExpectedAudience(authProvider);
                if (this.debugMode === true)
                    this.logger.compute(cid, `[Validator Debug] - Expected Audience: [${expectedAudience}]`);
                if (this.customAuthVerifier && authProvider == this.customAuthVerifier.getAuthProvider()) {
                    if (this.debugMode === true)
                        this.logger.compute(cid, `[Validator Debug] - Using Custom Auth Provider`);
                    return yield (0, CustomAuthCheck_1.customAuthCheck)(cid, authorizationHeader, this.customAuthVerifier, this.logger);
                }
                else if (authProvider == AuthProviders_1.AUTH_PROVIDERS.google) {
                    if (this.debugMode === true)
                        this.logger.compute(cid, `[Validator Debug] - Using Google Auth Provider`);
                    const googleAuthCheckResult = yield (0, GoogleAuthCheck_1.googleAuthCheck)(cid, authorizationHeader, String(expectedAudience), this.logger, this.debugMode);
                    if (this.debugMode === true)
                        this.logger.compute(cid, `[Validator Debug] - UserContext created by Google Auth Check: [${JSON.stringify(GoogleAuthCheck_1.googleAuthCheck)}]`);
                    return googleAuthCheckResult;
                }
            }
        });
    }
}
exports.Validator = Validator;
class ValidationError extends Error {
    constructor(code, message, subcode) {
        super();
        this.code = code;
        this.message = message;
        this.subcode = subcode;
    }
}
exports.ValidationError = ValidationError;
class LazyValidator extends Validator {
    constructor() {
        super(new ConfigMock(), new TotoLogger_1.Logger(""));
    }
}
exports.LazyValidator = LazyValidator;
class ConfigMock {
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    getCustomAuthVerifier() {
        return undefined;
    }
    getProps() {
        return {};
    }
    getExpectedAudience() {
        return "";
    }
}
exports.ConfigMock = ConfigMock;
