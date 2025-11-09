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
exports.ConfigMock = exports.LazyValidator = exports.ValidationError = exports.Validator = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const GoogleAuthCheck_1 = require("./GoogleAuthCheck");
const TotoControllerConfig_1 = require("../model/TotoControllerConfig");
const AuthProviders_1 = require("../model/AuthProviders");
const TotoLogger_1 = require("../logger/TotoLogger");
const TokenUtil_1 = require("../util/TokenUtil");
const extractTokenFromAuthHeader = (authorizationHeader) => {
    return String(authorizationHeader).substring('Bearer'.length + 1);
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
     */
    constructor(config, logger, debugMode = false) {
        this.props = config.getProps();
        this.logger = logger;
        this.config = config;
        this.debugMode = debugMode;
        if (debugMode)
            this.logger.compute("", `[Validator Debug] - Constructing Validator with Config props: ${JSON.stringify(this.props)}`);
    }
    /**
     * Validates the provided request
     * @param req Request the Express request
     * @returns a Promise
     */
    validate(req, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Extraction of the headers
            // Authorization & AuthProvider
            let authorizationHeader = (_a = req.headers['authorization']) !== null && _a !== void 0 ? _a : req.headers['Authorization'];
            // Correlation ID 
            let cid = (_b = String(req.headers['x-correlation-id'])) !== null && _b !== void 0 ? _b : "";
            if (this.debugMode)
                this.logger.compute(cid, `[Validator Debug] - Validation starting with Config props: ${JSON.stringify(this.props)}`);
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
                // Check if Path Options allow for this route to be auth free
                if (!options || options.noAuth == false) {
                    if (!authorizationHeader)
                        throw new ValidationError(401, "No Authorization Header provided");
                    // Decode the JWT token
                    const decodedToken = (0, TokenUtil_1.decodeJWT)(String(authorizationHeader));
                    // Retrieve the auth provider from the JWT Token
                    const authProvider = getAuthProvider(decodedToken);
                    if (this.debugMode === true)
                        this.logger.compute(cid, `[Validator Debug] - Auth Provider: [${authProvider}]`);
                    // Retrieve the audience that the token will be validated against
                    // That is the audience that is expected to be found in the token
                    const expectedAudience = this.config.getExpectedAudience();
                    if (this.debugMode === true)
                        this.logger.compute(cid, `[Validator Debug] - Expected Audience: [${expectedAudience}]`);
                    if (authProvider.toLowerCase() == AuthProviders_1.AUTH_PROVIDERS.toto) {
                        if (this.debugMode === true)
                            this.logger.compute(cid, `[Validator Debug] - Using Custom Auth Provider ${this.config.getProps().customAuthProvider}]. Verifying token`);
                        // Get the Toto JWT signing key
                        const key = this.config.getSigningKey();
                        // Verify the token using jsonwebtoken
                        const jwtPayload = jwt.verify(extractTokenFromAuthHeader(String(authorizationHeader)), key);
                        return {
                            email: jwtPayload.user,
                            authProvider: jwtPayload.authProvider,
                            userId: jwtPayload.user
                        };
                    }
                    else if (authProvider.toLowerCase() == AuthProviders_1.AUTH_PROVIDERS.google) {
                        if (this.debugMode === true)
                            this.logger.compute(cid, `[Validator Debug] - Using Google Auth Provider`);
                        const googleAuthCheckResult = yield (0, GoogleAuthCheck_1.googleAuthCheck)(cid, authorizationHeader, String(expectedAudience), this.logger, this.debugMode);
                        if (this.debugMode === true)
                            this.logger.compute(cid, `[Validator Debug] - UserContext created by Google Auth Check: [${JSON.stringify(GoogleAuthCheck_1.googleAuthCheck)}]`);
                        return googleAuthCheckResult;
                    }
                    else {
                        if (this.debugMode === true)
                            this.logger.compute(cid, `[Validator Debug] - UserContext will be null as no Auth Provider could be determined.`);
                    }
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
class ConfigMock extends TotoControllerConfig_1.TotoControllerConfig {
    constructor() {
        super({ apiName: "fake-api" });
    }
    getSigningKey() {
        return "fake-key";
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    getProps() {
        return {};
    }
    getExpectedAudience() {
        return "";
    }
}
exports.ConfigMock = ConfigMock;
