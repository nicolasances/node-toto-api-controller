"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newTotoServiceToken = newTotoServiceToken;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generates a new JWT token for the Toto service.
 *
 * Important: the token represents a service, not a user. The user field is set to the name of the microservice (extracted from the config).
 *
 * @param config the Toto Controller Config
 * @returns a JWT token
 */
function newTotoServiceToken(config) {
    let exp = (0, moment_timezone_1.default)().tz("Europe/Rome").add(3, "hours").unix();
    let token = jsonwebtoken_1.default.sign({ user: config.getAPIName(), authProvider: "toto", exp: exp }, config.getSigningKey());
    return token;
}
