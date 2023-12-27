"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotoRuntimeError = void 0;
class TotoRuntimeError extends Error {
    constructor(code, message, subcode) {
        super();
        this.code = code;
        this.message = message;
        this.subcode = subcode;
    }
}
exports.TotoRuntimeError = TotoRuntimeError;
