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
var crypto_js_1 = __importDefault(require("crypto-js"));
var moment_1 = __importDefault(require("moment"));
var BitfinexOrderMessageCommands;
(function (BitfinexOrderMessageCommands) {
    BitfinexOrderMessageCommands["NEW_ORDER"] = "on";
    BitfinexOrderMessageCommands["ORDER_CLOSED"] = "oc";
    BitfinexOrderMessageCommands["ORDER_UPDATED"] = "ou";
})(BitfinexOrderMessageCommands || (BitfinexOrderMessageCommands = {}));
var BitfinexTradeMessageCommands;
(function (BitfinexTradeMessageCommands) {
    BitfinexTradeMessageCommands["TRADE_EXECUTED"] = "tu";
    BitfinexTradeMessageCommands["TRADE_EXECUTED_UPDATED"] = "te";
})(BitfinexTradeMessageCommands || (BitfinexTradeMessageCommands = {}));
var isBitfinexOrderMessage = function (message) {
    return Object.values(BitfinexOrderMessageCommands).includes(message[1]);
};
var isBitfinexTradeMessage = function (message) {
    return Object.values(BitfinexTradeMessageCommands).includes(message[1]);
};
var bitfinex = /** @class */ (function (_super) {
    __extends(bitfinex, _super);
    function bitfinex(params) {
        var _this = _super.call(this, __assign(__assign({}, params), { url: 'wss://api.bitfinex.com/ws/2', name: 'bitfinex' })) || this;
        _this._orderTypeMap = {
            limit: 'EXCHANGE LIMIT'
        };
        _this.updateFee = function (_a) {
            var orderId = _a.orderId;
            if (!_this.getCachedOrder(orderId)) {
                throw new Error('Order does not exist.');
            }
            var fee = undefined;
            var order = _this.getCachedOrder(orderId);
            var trades = order.trades;
            if (trades) {
                for (var _i = 0, trades_1 = trades; _i < trades_1.length; _i++) {
                    var trade = trades_1[_i];
                    if (trade.fee) {
                        if (!fee || !fee.currency) {
                            fee = {
                                currency: trade.fee.currency,
                                cost: trade.fee.cost
                            };
                        }
                        else {
                            if (fee.currency !== trade.fee.currency) {
                                throw new Error('Mixed currency fees not supported.');
                            }
                            fee.cost += trade.fee.cost;
                        }
                    }
                }
            }
            _this.saveCachedOrder(__assign(__assign({}, order), { fee: fee }));
        };
        _this.onMessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var data, order, type, trade, order;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = JSON.parse(event.data);
                        if (!isBitfinexOrderMessage(data)) return [3 /*break*/, 1];
                        order = this.parseOrder(data[2]);
                        type = this.parseOrderEventType(data[1]);
                        this.saveCachedOrder(order);
                        this.updateFee({ orderId: order.id });
                        this.onOrder({ type: type, order: this.getCachedOrder(order.id) });
                        return [3 /*break*/, 3];
                    case 1:
                        if (!isBitfinexTradeMessage(data)) return [3 /*break*/, 3];
                        trade = this.parseTrade(data[2]);
                        return [4 /*yield*/, this.saveCachedTrade({ trade: trade, orderId: data[2][3] })];
                    case 2:
                        order = _a.sent();
                        this.updateFee({ orderId: order.id });
                        this.onOrder({ type: exchange_1.OrderEventType.ORDER_UPDATED, order: this.getCachedOrder(order.id) });
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this._doAuth = function () {
            var credentials = _this.getCredentials();
            _this.assertConnected();
            var authNonce = Date.now() * 1000;
            var authPayload = 'AUTH' + authNonce;
            var authSig = crypto_js_1.default.HmacSHA384(authPayload, credentials.secret).toString(crypto_js_1.default.enc.Hex);
            var payload = {
                apiKey: credentials.apiKey,
                authSig: authSig,
                authNonce: authNonce,
                authPayload: authPayload,
                event: 'auth',
                filter: _this._subscribeFilter
            };
            _this._send(JSON.stringify(payload));
        };
        _this.createClientId = function () {
            return _this._random().toString();
        };
        _this.onOpen = function () {
            _this._doAuth();
        };
        _this.createOrder = function (_a) {
            var order = _a.order;
            return __awaiter(_this, void 0, void 0, function () {
                var clientId, marketId, orderData, payload;
                return __generator(this, function (_b) {
                    clientId = order.clientId ? order.clientId : this.createClientId();
                    marketId = this._ccxtInstance.market(order.symbol).id;
                    orderData = {
                        gid: 1,
                        cid: parseInt(clientId),
                        type: this._orderTypeMap[order.type],
                        symbol: "t" + marketId,
                        amount: order.side === 'buy' ? order.amount.toString() : (-1 * order.amount).toString(),
                        price: order.price.toString(),
                        flags: 0
                    };
                    payload = [0, 'on', null, orderData];
                    this._send(JSON.stringify(payload));
                    return [2 /*return*/];
                });
            });
        };
        _this.cancelOrder = function (_a) {
            var id = _a.id;
            return __awaiter(_this, void 0, void 0, function () {
                var orderData, payload;
                return __generator(this, function (_b) {
                    orderData = {
                        id: id
                    };
                    payload = [0, 'oc', null, orderData];
                    this._send(JSON.stringify(payload));
                    return [2 /*return*/];
                });
            });
        };
        _this.parseOrder = function (data) {
            var type = 'unknown';
            switch (data[8]) {
                case 'EXCHANGE MARKET':
                case 'MARKET':
                    type = 'market';
                    break;
                case 'EXCHANGE LIMIT':
                case 'LIMIT':
                    type = 'limit';
                    break;
            }
            var status = _this.parseOrderStatus(data[13]);
            var market = _this._ccxtInstance.findMarket(data[3].substr(1, 6));
            if (!market) {
                market = { symbol: data[3].substr(1, 3) + '/' + data[3].substr(4, 3) };
            }
            var order = {
                id: data[0],
                clientId: data[2] ? data[2].toString() : undefined,
                symbol: market.symbol,
                timestamp: data[4],
                datetime: moment_1.default(data[4]).toISOString(),
                amount: Math.abs(data[7]),
                filled: Math.abs(data[7]) - Math.abs(data[6]),
                type: type,
                average: data[17],
                cost: Math.abs(data[17] * data[7]),
                price: data[17],
                remaining: Math.abs(data[6]),
                side: data[7] > 0 ? 'buy' : 'sell',
                status: status
            };
            return order;
        };
        _this.parseTrade = function (data) {
            var trade = {
                id: data[0],
                timestamp: data[2],
                amount: Math.abs(data[4]),
                price: data[5],
                maker: data[8] === 1,
                fee: {
                    cost: Math.abs(data[9]),
                    currency: data[10]
                }
            };
            return trade;
        };
        _this.parseOrderEventType = function (data) {
            switch (data) {
                case 'on':
                    return exchange_1.OrderEventType.ORDER_CREATED;
                case 'ou':
                    return exchange_1.OrderEventType.ORDER_UPDATED;
                case 'oc':
                    return exchange_1.OrderEventType.ORDER_CLOSED;
                default:
                    throw new Error("Unknown bitfinex event type " + data);
            }
        };
        _this.parseOrderStatus = function (data) {
            if (data.includes('ACTIVE')) {
                return 'open';
            }
            else if (data.includes('CANCELED')) {
                return 'canceled';
            }
            else if (data.includes('EXECUTED')) {
                return 'closed';
            }
            return 'unknown';
        };
        _this.subscriptionKeyMapping = {
            orders: 'trading'
        };
        return _this;
    }
    return bitfinex;
}(exchange_1.Exchange));
exports.bitfinex = bitfinex;
//# sourceMappingURL=bitfinex.js.map