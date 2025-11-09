"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPPubSubImpl = void 0;
const PubSubImplementation_1 = require("../../PubSubImplementation");
const GCPPubSubRequestValidator_1 = require("./GCPPubSubRequestValidator");
class GCPPubSubImpl extends PubSubImplementation_1.APubSubImplementation {
    filter(req) {
        return null;
    }
    getRequestValidator() {
        return new GCPPubSubRequestValidator_1.GCPPubSubRequestValidator(this.config, this.logger);
    }
    convertMessage(req) {
        let msg = JSON.parse(String(Buffer.from(req.body.message.data, 'base64')));
        return {
            timestamp: msg.timestamp,
            cid: msg.cid,
            id: msg.id,
            type: msg.type,
            msg: msg.msg,
            data: msg.data
        };
    }
}
exports.GCPPubSubImpl = GCPPubSubImpl;
