"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationId = correlationId;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
function correlationId() {
    let ts = (0, moment_timezone_1.default)().tz('Europe/Rome').format('YYYYMMDDHHmmssSSS');
    let random = (Math.random() * 100000).toFixed(0).padStart(5, '0');
    return ts + '' + random;
}
