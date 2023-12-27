"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicallyHandleError = void 0;
const TotoRuntimeError_1 = require("../model/TotoRuntimeError");
const Validator_1 = require("../validation/Validator");
function basicallyHandleError(error, logger, cid) {
    logger.compute(cid, `${error}`, "error");
    if (error instanceof Validator_1.ValidationError || error instanceof TotoRuntimeError_1.TotoRuntimeError) {
        throw error;
    }
    console.log(error);
    throw error;
}
exports.basicallyHandleError = basicallyHandleError;
