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
var decimal_js_1 = __importDefault(require("decimal.js"));
var moment_1 = __importDefault(require("moment"));
var base_client_1 = require("../base-client");
var exchange_1 = require("../exchange");
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
var BitfinexWalletMessageCommands;
(function (BitfinexWalletMessageCommands) {
    BitfinexWalletMessageCommands["WALLET_STATUS"] = "ws";
})(BitfinexWalletMessageCommands || (BitfinexWalletMessageCommands = {}));
var BitfinexWalletUpdateMessageCommands;
(function (BitfinexWalletUpdateMessageCommands) {
    BitfinexWalletUpdateMessageCommands["WALLET_UPDATED"] = "wu";
})(BitfinexWalletUpdateMessageCommands || (BitfinexWalletUpdateMessageCommands = {}));
var isBitfinexOrderMessage = function (message) {
    return Object.values(BitfinexOrderMessageCommands).includes(message[1]);
};
var isBitfinexTradeMessage = function (message) {
    return Object.values(BitfinexTradeMessageCommands).includes(message[1]);
};
var isBitfinexWalletMessage = function (message) {
    return Object.values(BitfinexWalletMessageCommands).includes(message[1]);
};
var isBitfinexWalletUpdateMessage = function (message) {
    return Object.values(BitfinexWalletUpdateMessageCommands).includes(message[1]);
};
var balanceWalletType = function (wallet) {
    switch (wallet) {
        case 'margin':
            return 'margin';
        case null:
        case undefined:
        case 'exchange':
            return 'spot';
        default:
            return undefined;
    }
};
var bitfinex = /** @class */ (function (_super) {
    __extends(bitfinex, _super);
    function bitfinex(params) {
        var _this = _super.call(this, __assign(__assign({}, params), { url: 'wss://api.bitfinex.com/ws/2', name: 'bitfinex' })) || this;
        _this._orderTypeMap = {
            limit: 'EXCHANGE LIMIT',
        };
        _this.createClientId = function () {
            return _this._random().toString();
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
                        flags: 0,
                    };
                    payload = [0, 'on', null, orderData];
                    this.send(JSON.stringify(payload));
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
                        id: id,
                    };
                    payload = [0, 'oc', null, orderData];
                    this.send(JSON.stringify(payload));
                    return [2 /*return*/];
                });
            });
        };
        _this.onMessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var data, order, type, trade, order, _i, _a, message, balance, balance;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = JSON.parse(event.data);
                        if (!(isBitfinexOrderMessage(data) && this._walletType === 'spot')) return [3 /*break*/, 1];
                        order = this.parseOrder(data[2]);
                        type = this.parseOrderEventType(data[1]);
                        this.saveCachedOrder(order);
                        this.updateFeeFromTrades({ orderId: order.id });
                        this.onOrder({ type: type, order: this.getCachedOrder(order.id) });
                        return [3 /*break*/, 4];
                    case 1:
                        if (!(isBitfinexTradeMessage(data) && this._walletType === 'spot')) return [3 /*break*/, 3];
                        trade = this.parseTrade(data[2]);
                        return [4 /*yield*/, this.saveCachedTrade({ trade: trade, orderId: data[2][3] })];
                    case 2:
                        order = _b.sent();
                        this.updateFeeFromTrades({ orderId: order.id });
                        this.onOrder({ type: exchange_1.OrderEventType.ORDER_UPDATED, order: this.getCachedOrder(order.id) });
                        return [3 /*break*/, 4];
                    case 3:
                        if (isBitfinexWalletMessage(data)) {
                            for (_i = 0, _a = data[2]; _i < _a.length; _i++) {
                                message = _a[_i];
                                balance = this.parseBalance(message);
                                if (balance) {
                                    this.emit('balance', { update: balance });
                                }
                            }
                        }
                        else if (isBitfinexWalletUpdateMessage(data)) {
                            balance = this.parseBalance(data[2]);
                            if (balance) {
                                this.emit('balance', { update: balance });
                            }
                        }
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        _this.onOpen = function () {
            _this._doAuth();
        };
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
                filter: _this._subscribeFilter,
            };
            _this.send(JSON.stringify(payload));
        };
        _this.getOrderType = function (type) {
            switch (type) {
                case 'EXCHANGE MARKET':
                case 'MARKET':
                    return 'market';
                case 'EXCHANGE LIMIT':
                case 'LIMIT':
                    return 'limit';
                case 'EXCHANGE STOP LIMIT':
                case 'EXCHANGE STOP':
                    return 'stop';
                case 'EXCHANGE TRAILING STOP':
                case 'TRAILING STOP':
                    return 'trailing-stop';
            }
            return 'market';
        };
        _this.parseOrder = function (data) {
            var status = _this.parseOrderStatus(data[13]);
            var base = _this._ccxtInstance['safeCurrencyCode'](data[3].substr(1, 3));
            var quote = _this._ccxtInstance['safeCurrencyCode'](data[3].substr(4, 3));
            var symbol = base + '/' + quote;
            var market = _this._ccxtInstance.market(symbol);
            if (!market) {
                market = { symbol: symbol };
            }
            var order = {
                id: data[0].toString(),
                clientId: data[2] ? data[2].toString() : undefined,
                symbol: market.symbol,
                timestamp: data[4],
                datetime: moment_1.default(data[4]).toISOString(),
                amount: Math.abs(data[7]),
                filled: Math.abs(data[7]) - Math.abs(data[6]),
                type: _this.getOrderType(data[8]),
                cost: Math.abs(data[16] * data[7]),
                price: data[16],
                remaining: Math.abs(data[6]),
                side: data[7] > 0 ? 'buy' : 'sell',
                status: status,
                info: data,
            };
            return order;
        };
        _this.parseTrade = function (data) {
            var amount = Math.abs(data[4]);
            var price = data[5];
            var timestamp = data[2];
            var symbol = data[1].substr(1, 6);
            var trade = {
                id: data[0],
                timestamp: timestamp,
                amount: amount,
                price: price,
                takerOrMaker: data[8] === 1 ? 'maker' : 'taker',
                fee: {
                    cost: Math.abs(data[9]),
                    currency: data[10],
                },
                info: data,
                cost: price * amount,
                datetime: moment_1.default(timestamp).toISOString(),
                order: data[3],
                side: data[4] > 0 ? 'buy' : 'sell',
                symbol: _this._ccxtInstance.markets_by_id[symbol]
                    ? _this._ccxtInstance.markets_by_id[symbol].symbol
                    : symbol,
                type: _this.getOrderType(data[6]),
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
        _this.parseBalance = function (message) {
            var _a;
            if (_this._walletType !== balanceWalletType(message[0])) {
                return undefined;
            }
            var currency = _this._ccxtInstance['safeCurrencyCode'](message[1]);
            if (message[4] === null) {
                _this.send(JSON.stringify([0, 'calc', null, [["wallet_funding_" + currency]]]));
                return undefined;
            }
            var free = new decimal_js_1.default(message[4]);
            var total = new decimal_js_1.default(message[2]);
            var used = !total.eq(free) && message[3] === 0 ? new decimal_js_1.default(total).minus(free) : new decimal_js_1.default(message[3]);
            return _this._ccxtInstance['parseBalance']((_a = {},
                _a[currency] = { free: free.toNumber(), total: total.toNumber(), used: used.toNumber() },
                _a.info = message,
                _a));
        };
        _this._walletType = _this._walletType || 'spot';
        _this.subscriptionKeyMapping = {
            orders: 'trading',
            balance: 'wallet',
        };
        return _this;
    }
    return bitfinex;
}(base_client_1.BaseClient));
exports.bitfinex = bitfinex;
//# sourceMappingURL=bitfinex.js.map