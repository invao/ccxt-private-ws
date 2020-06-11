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
var crypto_js_1 = __importDefault(require("crypto-js"));
var base_client_1 = require("../base-client");
var exchange_1 = require("../exchange");
var ftx = /** @class */ (function (_super) {
    __extends(ftx, _super);
    function ftx(params) {
        var _this = _super.call(this, __assign(__assign({}, params), { url: 'wss://ftx.com/ws/', name: 'ftx' })) || this;
        _this.createClientId = function () {
            return _this._random().toString();
        };
        _this.onOpen = function () {
            _this._doAuth();
        };
        _this._doAuth = function () {
            var credentials = _this.getCredentials();
            _this.assertConnected();
            var time = Date.now();
            var sign = crypto_js_1.default.HmacSHA256(time + "websocket_login", credentials.secret).toString(crypto_js_1.default.enc.Hex);
            var payload = {
                op: 'login',
                args: {
                    key: credentials.apiKey,
                    sign: sign,
                    time: time,
                    subaccount: _this._accountId,
                },
            };
            _this.send(JSON.stringify(payload));
            _this.subscribe();
        };
        _this.onMessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var _a, channel, type, data, _b, order, type_1, trade, order;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = JSON.parse(event.data), channel = _a.channel, type = _a.type, data = _a.data;
                        if (!(type === 'update' && data)) return [3 /*break*/, 4];
                        _b = channel;
                        switch (_b) {
                            case 'orders': return [3 /*break*/, 1];
                            case 'fills': return [3 /*break*/, 2];
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        {
                            order = this.parseOrder(data);
                            if (!this.isCorrectMarketType(order)) {
                                return [2 /*return*/];
                            }
                            type_1 = this.parseOrderEventType(data);
                            this.saveCachedOrder(order);
                            this.updateFeeFromTrades({ orderId: order.id });
                            this.onOrder({ type: type_1, order: this.getCachedOrder(order.id) });
                            return [3 /*break*/, 4];
                        }
                        _c.label = 2;
                    case 2:
                        trade = this.parseTrade(data);
                        if (!this.isCorrectMarketType(trade) || !trade.order) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.saveCachedTrade({ trade: trade, orderId: trade.order })];
                    case 3:
                        order = _c.sent();
                        this.updateFeeFromTrades({ orderId: order.id });
                        this.onOrder({ type: exchange_1.OrderEventType.ORDER_UPDATED, order: this.getCachedOrder(order.id) });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        _this.parseOrderEventType = function (order) {
            var originalOrder = _this.getCachedOrder(order.id);
            if (!originalOrder) {
                return exchange_1.OrderEventType.ORDER_CREATED;
            }
            if (order.status === 'closed' && originalOrder.status !== 'closed') {
                return exchange_1.OrderEventType.ORDER_CLOSED;
            }
            else if (order.status === 'canceled' && originalOrder.status !== 'canceled') {
                return exchange_1.OrderEventType.ORDER_CANCELED;
            }
            else if (order.status === 'failed' && originalOrder.status !== 'failed') {
                return exchange_1.OrderEventType.ORDER_FAILED;
            }
            return exchange_1.OrderEventType.ORDER_UPDATED;
        };
        _this.subscribe = function () {
            _this.send(JSON.stringify({ op: 'subscribe', channel: 'orders' }));
            _this.send(JSON.stringify({ op: 'subscribe', channel: 'fills' }));
        };
        _this.ping = function () { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.assertConnected()];
                    case 1:
                        _a.sent();
                        this.send(JSON.stringify({ op: 'ping' }));
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.parseOrder = function (data) {
            return _this._ccxtInstance['parseOrder'](data);
        };
        _this.parseTrade = function (data) {
            return _this._ccxtInstance['parseTrade'](data);
        };
        _this.isCorrectMarketType = function (order) {
            var _a = order.symbol.split('/'), base = _a[0], quote = _a[1];
            switch (_this._walletType) {
                case undefined:
                case null:
                case 'spot':
                    return base && quote;
                case 'future':
                    return base && !quote;
                default:
                    return false;
            }
        };
        _this.subscriptionKeyMapping = {
            orders: 'orders',
            fills: 'fills',
        };
        setInterval(_this.ping, 15000);
        return _this;
    }
    return ftx;
}(base_client_1.BaseClient));
exports.ftx = ftx;
//# sourceMappingURL=ftx.js.map