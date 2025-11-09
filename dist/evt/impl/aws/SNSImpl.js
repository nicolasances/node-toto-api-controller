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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNSImpl = void 0;
const PubSubImplementation_1 = require("../../PubSubImplementation");
const SNSRequestValidator_1 = require("./SNSRequestValidator");
const TotoAPIController_1 = require("../../../TotoAPIController");
const https_1 = __importDefault(require("https"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class SNSImpl extends PubSubImplementation_1.APubSubImplementation {
    getRequestValidator() {
        return new SNSRequestValidator_1.SNSRequestValidator(this.config, this.logger);
    }
    filter(req) {
        if (req.get('x-amz-sns-message-type') == 'SubscriptionConfirmation')
            return new SNSSubscriptionConfirmationFilter(this.logger);
        return null;
    }
    convertMessage(req) {
        if (req.get('x-amz-sns-message-type') == 'SubscriptionConfirmation' || req.get('x-amz-sns-message-type') == 'UnsubscribeConfirmation') {
            this.logger.compute('', `Confirming SNS subscription/unsubscription message.`);
            return {
                timestamp: (0, moment_timezone_1.default)().tz('Europe/Rome').format("YYYY.MM.DD HH:mm:ss"),
                cid: '',
                id: '',
                type: req.get('x-amz-sns-message-type'),
                msg: '',
                data: req.body
            };
        }
        const message = req.body;
        if (message.Type == 'SubscriptionConfirmation' || message.Type == 'UnsubscribeConfirmation')
            return {
                timestamp: (0, moment_timezone_1.default)().tz('Europe/Rome').format("YYYY.MM.DD HH:mm:ss"),
                cid: '',
                id: '',
                type: message.Type,
                msg: '',
                data: message
            };
        if (message.Type == 'Notification') {
            // The message is in the "Message" field
            try {
                const payload = JSON.parse(message.Message);
                return {
                    timestamp: payload.timestamp,
                    cid: payload.cid,
                    id: payload.id,
                    type: payload.type,
                    msg: payload.msg,
                    data: payload.data
                };
            }
            catch (error) {
                // If the error is a parsing error
                if (error instanceof SyntaxError) {
                    this.logger.compute('', `SNS message is not a valid JSON: ${message.Message}`);
                    console.log(error);
                    throw new TotoAPIController_1.ValidationError(400, 'SNS message is not a valid JSON');
                }
                throw error;
            }
        }
        throw new TotoAPIController_1.ValidationError(400, `Unsupported SNS message type: ${message.Type}`);
    }
}
exports.SNSImpl = SNSImpl;
class SNSSubscriptionConfirmationFilter {
    constructor(logger) {
        this.logger = logger;
    }
    handle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Confirm the subscription by calling the SubscribeURL
            const message = req.body;
            const subscribeUrl = message.SubscribeURL;
            this.logger.compute('', `Confirming SNS subscription: ${subscribeUrl}`);
            https_1.default.get(subscribeUrl, {}, (response) => {
                if (response.statusCode === 200) {
                    this.logger.compute('', `SNS subscription confirmed successfully.`);
                }
                else {
                    this.logger.compute('', `Failed to confirm SNS subscription. Status: ${response.statusCode}`);
                }
            }).on('error', (err) => {
                this.logger.compute('', `Error confirming SNS subscription: ${err.message}`);
            });
        });
    }
}
