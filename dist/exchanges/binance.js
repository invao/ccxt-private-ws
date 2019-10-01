"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var exchange_1 = require("../exchange");
var node_fetch_1 = __importDefault(require("node-fetch"));
var qs_1 = __importDefault(require("qs"));
var crypto_1 = __importDefault(require("crypto"));
var moment_1 = __importDefault(require("moment"));
var binance = /** @class */ (function (_super) {
    __extends(binance, _super);
    function binance(params) {
        var _this = _super.call(this, __assign(__assign({}, params), { url: 'wss://ws-auth.kraken.com', name: 'binance' })) || this;
        _this.onMessage = function (event) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        _this.onOpen = function () { return __awaiter(_this, void 0, void 0, function () {
            var params, uri, apiSign, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._credentials.apiKey) {
                            throw new Error('Missing api key.');
                        }
                        if (!this._credentials.secret) {
                            throw new Error('Missing api key.');
                        }
                        params = { nonce: moment_1.default().valueOf() };
                        uri = 'https://api.kraken.com/0/private/GetWebSocketsToken';
                        apiSign = this.getSignature({
                            uri: uri,
                            request: params,
                            secret: this._credentials.secret,
                            nonce: params.nonce
                        });
                        return [4 /*yield*/, node_fetch_1.default(uri, {
                                headers: { 'API-Key': this._credentials.apiKey, 'API-Sign': apiSign }
                            })];
                    case 1:
                        response = _a.sent();
                        console.log('RESPONSE', response.json());
                        return [2 /*return*/];
                }
            });
        }); };
        _this.getSignature = function (_a) {
            var uri = _a.uri, request = _a.request, secret = _a.secret, nonce = _a.nonce;
            var message = qs_1.default.stringify(request);
            var secret_buffer = new Buffer(secret, 'base64');
            var hash = crypto_1.default.createHash('sha256');
            var hmac = crypto_1.default.createHmac('sha512', secret_buffer);
            var hash_digest = hash.update(nonce + message).digest();
            var hmac_digest = hmac.update(uri + hash_digest).digest('base64');
            return hmac_digest;
        };
        return _this;
    }
    return binance;
}(exchange_1.Exchange));
exports.binance = binance;
