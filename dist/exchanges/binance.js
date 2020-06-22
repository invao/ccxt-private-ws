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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ccxt_1 = __importDefault(require("ccxt"));
var moment_1 = __importDefault(require("moment"));
var R = __importStar(require("ramda"));
var base_client_1 = require("../base-client");
var exchange_1 = require("../exchange");
var BinanceSpotOrderExecutionType;
(function (BinanceSpotOrderExecutionType) {
    BinanceSpotOrderExecutionType["NEW"] = "NEW";
    BinanceSpotOrderExecutionType["CANCELED"] = "CANCELED";
    BinanceSpotOrderExecutionType["REPLACED"] = "REPLACED";
    BinanceSpotOrderExecutionType["REJECTED"] = "REJECTED";
    BinanceSpotOrderExecutionType["EXPIRED"] = "EXPIRED";
    BinanceSpotOrderExecutionType["TRADE"] = "TRADE";
})(BinanceSpotOrderExecutionType || (BinanceSpotOrderExecutionType = {}));
var BinanceSpotOrderStatus;
(function (BinanceSpotOrderStatus) {
    BinanceSpotOrderStatus["NEW"] = "NEW";
    BinanceSpotOrderStatus["PARTIALLY_FILLED"] = "PARTIALLY_FILLED";
    BinanceSpotOrderStatus["FILLED"] = "FILLED";
    BinanceSpotOrderStatus["CANCELED"] = "CANCELED";
    BinanceSpotOrderStatus["PENDING_CANCEL"] = "PENDING_CANCEL";
    BinanceSpotOrderStatus["REJECTED"] = "REJECTED";
    BinanceSpotOrderStatus["EXPIRED"] = "EXPIRED";
})(BinanceSpotOrderStatus || (BinanceSpotOrderStatus = {}));
var BinanceFutureOrderExecutionType;
(function (BinanceFutureOrderExecutionType) {
    BinanceFutureOrderExecutionType["NEW"] = "NEW";
    BinanceFutureOrderExecutionType["PARTIAL_FILL"] = "PARTIAL_FILL";
    BinanceFutureOrderExecutionType["FILL"] = "FILL";
    BinanceFutureOrderExecutionType["CANCELED"] = "CANCELED";
    BinanceFutureOrderExecutionType["PENDING_CANCEL"] = "PENDING_CANCEL";
    BinanceFutureOrderExecutionType["REJECTED"] = "REJECTED";
    BinanceFutureOrderExecutionType["CALCULATED"] = "CALCULATED";
    BinanceFutureOrderExecutionType["EXPIRED"] = "EXPIRED";
    BinanceFutureOrderExecutionType["TRADE"] = "TRADE";
    BinanceFutureOrderExecutionType["RESTATED"] = "RESTATED";
})(BinanceFutureOrderExecutionType || (BinanceFutureOrderExecutionType = {}));
var BinanceFutureOrderStatus;
(function (BinanceFutureOrderStatus) {
    BinanceFutureOrderStatus["NEW"] = "NEW";
    BinanceFutureOrderStatus["PARTIALLY_FILLED"] = "PARTIALLY_FILLED";
    BinanceFutureOrderStatus["FILLED"] = "FILLED";
    BinanceFutureOrderStatus["CANCELED"] = "CANCELED";
    BinanceFutureOrderStatus["PENDING_CANCEL"] = "PENDING_CANCEL";
    BinanceFutureOrderStatus["REJECTED"] = "REJECTED";
    BinanceFutureOrderStatus["EXPIRED"] = "EXPIRED";
    BinanceFutureOrderStatus["REPLACED"] = "REPLACED";
    BinanceFutureOrderStatus["STOPPED"] = "STOPPED";
    BinanceFutureOrderStatus["NEW_INSURANCE"] = "NEW_INSURANCE";
    BinanceFutureOrderStatus["NEW_ADL"] = "NEW_ADL";
})(BinanceFutureOrderStatus || (BinanceFutureOrderStatus = {}));
var isBinanceSpotOrderMessage = function (message) {
    return (message.e === 'executionReport' &&
        message.x !== 'TRADE');
};
var isBinanceSpotTradeMessage = function (message) {
    return (message.e === 'executionReport' &&
        message.x === 'TRADE');
};
var isBinanceSpotAccountInfoMessage = function (message) {
    return message.e === 'outboundAccountInfo';
};
var isBinanceSpotAccountPositionMessage = function (message) {
    return message.e === 'outboundAccountPosition';
};
var isBinanceFutureOrderMessage = function (message) {
    return (message.e === 'ORDER_TRADE_UPDATE' &&
        message.o.x !== 'TRADE');
};
var isBinanceFutureTradeMessage = function (message) {
    return (message.e === 'ORDER_TRADE_UPDATE' &&
        message.o.x === 'TRADE');
};
var isBinanceFutureAccountInfoMessage = function (message) {
    return message.e === 'ACCOUNT_UPDATE';
};
var binance = /** @class */ (function (_super) {
    __extends(binance, _super);
    function binance(params) {
        var _this = _super.call(this, __assign(__assign({}, params), { url: '', name: 'binance' })) || this;
        _this.onMessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._walletType;
                        switch (_a) {
                            case 'spot': return [3 /*break*/, 1];
                            case 'future': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.onSpotMessages(event)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.onFutureMessages(event)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        _this.onSpotMessages = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var data, orderId_1, orderId_2, balance, balance;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = JSON.parse(event.data);
                        if (!isBinanceSpotOrderMessage(data)) return [3 /*break*/, 2];
                        orderId_1 = this.getSpotOrderId(data);
                        return [4 /*yield*/, this.lock.acquire(orderId_1, function () { return __awaiter(_this, void 0, void 0, function () {
                                var type, order;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            type = this.getSpotOrderEventType(data);
                                            return [4 /*yield*/, this.parseSpotOrder(data)];
                                        case 1:
                                            order = _a.sent();
                                            return [4 /*yield*/, this.saveCachedOrder(order)];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, this.updateFeeFromTrades({ orderId: orderId_1 })];
                                        case 3:
                                            _a.sent();
                                            this.onOrder({ type: type, order: this.getCachedOrder(orderId_1) });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!isBinanceSpotTradeMessage(data)) return [3 /*break*/, 4];
                        orderId_2 = this.getSpotOrderId(data);
                        return [4 /*yield*/, this.lock.acquire(orderId_2, function () { return __awaiter(_this, void 0, void 0, function () {
                                var type, order, trade;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            type = this.getSpotOrderEventType(data);
                                            return [4 /*yield*/, this.parseSpotOrder(data)];
                                        case 1:
                                            order = _a.sent();
                                            return [4 /*yield*/, this.saveCachedOrder(order)];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, this.parseSpotTrade(data)];
                                        case 3:
                                            trade = _a.sent();
                                            return [4 /*yield*/, this.saveCachedTrade({ trade: trade, orderId: orderId_2 })];
                                        case 4:
                                            _a.sent();
                                            return [4 /*yield*/, this.updateFeeFromTrades({ orderId: orderId_2 })];
                                        case 5:
                                            _a.sent();
                                            this.onOrder({ type: type, order: this.getCachedOrder(orderId_2) });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        if (isBinanceSpotAccountInfoMessage(data)) {
                            balance = this.parseSpotBalance(data);
                            if (balance) {
                                this.emit('fullBalance', { update: balance });
                            }
                        }
                        else if (isBinanceSpotAccountPositionMessage(data)) {
                            balance = this.parseSpotBalance(data);
                            if (balance) {
                                this.emit('balance', { update: balance });
                            }
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        _this.onFutureMessages = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var data, orderId_3, orderId_4, positions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = JSON.parse(event.data).data;
                        if (!(isBinanceFutureOrderMessage(data) || isBinanceFutureTradeMessage(data))) return [3 /*break*/, 2];
                        orderId_3 = this.getFutureOrderId(data);
                        return [4 /*yield*/, this.lock.acquire(orderId_3, function () { return __awaiter(_this, void 0, void 0, function () {
                                var type, order;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            type = this.getFutureOrderEventType(data);
                                            return [4 /*yield*/, this.parseFutureOrder(data)];
                                        case 1:
                                            order = _a.sent();
                                            return [4 /*yield*/, this.saveCachedOrder(order)];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, this.updateFeeFromTrades({ orderId: orderId_3 })];
                                        case 3:
                                            _a.sent();
                                            this.onOrder({ type: type, order: this.getCachedOrder(orderId_3) });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!isBinanceFutureTradeMessage(data)) return [3 /*break*/, 4];
                        orderId_4 = this.getFutureOrderId(data);
                        return [4 /*yield*/, this.lock.acquire(orderId_4, function () { return __awaiter(_this, void 0, void 0, function () {
                                var type, order, trade;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            type = this.getFutureOrderEventType(data);
                                            return [4 /*yield*/, this.parseFutureOrder(data)];
                                        case 1:
                                            order = _a.sent();
                                            return [4 /*yield*/, this.saveCachedOrder(order)];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, this.parseFutureTrade(data)];
                                        case 3:
                                            trade = _a.sent();
                                            return [4 /*yield*/, this.saveCachedTrade({ trade: trade, orderId: orderId_4 })];
                                        case 4:
                                            _a.sent();
                                            return [4 /*yield*/, this.updateFeeFromTrades({ orderId: orderId_4 })];
                                        case 5:
                                            _a.sent();
                                            this.onOrder({ type: type, order: this.getCachedOrder(orderId_4) });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        if (isBinanceFutureAccountInfoMessage(data)) {
                            positions = this.parseFuturePositions(data);
                            if (positions.length) {
                                this.emit('positions', { update: positions });
                            }
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        _this._keepAlive = function () { return __awaiter(_this, void 0, void 0, function () {
            var ccxtInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ccxtInstance = new ccxt_1.default['binance'](__assign({}, this.getCredentials()));
                        return [4 /*yield*/, ccxtInstance.publicPutUserDataStream({ listenKey: this._listenKey })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this._doAuth = function () { return __awaiter(_this, void 0, void 0, function () {
            var ccxtInstance, endpoint, _a, futureDataStream, spotDataStream;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._publicCcxtInstance.loadMarkets()];
                    case 1:
                        _b.sent();
                        ccxtInstance = new ccxt_1.default['binance'](__assign({}, this.getCredentials()));
                        if (!this._keepAliveInterval) {
                            this._keepAliveInterval = setInterval(this._keepAlive, 1000 * 60 * 30);
                        }
                        endpoint = undefined;
                        _a = this._walletType;
                        switch (_a) {
                            case 'future': return [3 /*break*/, 2];
                            case 'spot': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, ccxtInstance.fapiPrivatePostListenKey()];
                    case 3:
                        futureDataStream = _b.sent();
                        this._listenKey = futureDataStream.listenKey;
                        endpoint = "wss://fstream.binance.com/stream?streams=" + this._listenKey;
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, ccxtInstance.publicPostUserDataStream()];
                    case 5:
                        spotDataStream = _b.sent();
                        this._listenKey = spotDataStream.listenKey;
                        endpoint = "wss://stream.binance.com:9443/ws/" + this._listenKey;
                        return [3 /*break*/, 6];
                    case 6:
                        if (!endpoint) {
                            throw new Error("Market type " + this._walletType + " not supported");
                        }
                        this.setUrl(endpoint);
                        return [2 /*return*/];
                }
            });
        }); };
        _this.preConnect = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._doAuth()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.onOpen = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        _this.createOrder = function (_a) {
            var order = _a.order;
            return __awaiter(_this, void 0, void 0, function () {
                var ccxtInstance, options, result;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            ccxtInstance = new ccxt_1.default['binance'](__assign({}, this.getCredentials()));
                            options = {};
                            if (order.clientId) {
                                options['newClientOrderId'] = parseInt(order.clientId);
                            }
                            return [4 /*yield*/, ccxtInstance.createOrder(order.symbol, 'limit', order.side, order.amount, order.price, options)];
                        case 1:
                            result = _b.sent();
                            return [4 /*yield*/, this.saveCachedOrder(result)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        _this.cancelOrder = function (_a) {
            var id = _a.id;
            return __awaiter(_this, void 0, void 0, function () {
                var ccxtInstance, order;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            ccxtInstance = new ccxt_1.default['binance'](__assign({}, this.getCredentials()));
                            order = this.getCachedOrder(id);
                            return [4 /*yield*/, ccxtInstance.cancelOrder(id, order.symbol)];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        _this.createClientId = function () {
            return _this._random().toString();
        };
        _this.getOrderType = function (type) {
            return type.toLocaleLowerCase();
        };
        _this.getSpotOrderId = function (message) {
            var id = message.i.toString();
            if (!id) {
                throw new Error('Invalid order message from binance.');
            }
            return id;
        };
        _this.parseSpotOrder = function (message) {
            var statuses = {
                NEW: 'open',
                PARTIALLY_FILLED: 'open',
                FILLED: 'closed',
                CANCELED: 'canceled',
                PENDING_CANCEL: 'open',
                REJECTED: 'failed',
                EXPIRED: 'canceled',
            };
            var id = _this.getSpotOrderId(message);
            var originalOrder = _this.getCachedOrder(id);
            var cost = parseFloat(message.Z);
            var filled = parseFloat(message.z);
            var amount = parseFloat(message.q);
            var order = {
                amount: amount,
                cost: cost,
                datetime: moment_1.default(message.T).toISOString(),
                timestamp: message.T,
                filled: parseFloat(message.z),
                info: message,
                price: cost && filled ? cost / filled : parseFloat(message.p),
                remaining: amount - filled,
                side: message.S === 'BUY' ? 'buy' : 'sell',
                status: statuses[message.X],
                symbol: _this._publicCcxtInstance.markets_by_id[message.s]
                    ? _this._publicCcxtInstance.markets_by_id[message.s].symbol
                    : message.s,
                trades: [],
                type: _this.getOrderType(message.o),
                clientId: message.c ? message.c : undefined,
                id: id,
            };
            var mergedOrder = R.mergeDeepWith(function (left, right) { return (right === undefined ? left : right); }, originalOrder, order);
            return mergedOrder;
        };
        _this.parseSpotTrade = function (message) {
            var price = parseFloat(message.L);
            var amount = parseFloat(message.l);
            return {
                info: message,
                timestamp: message.T,
                datetime: moment_1.default(message.T).toISOString(),
                symbol: _this._publicCcxtInstance.markets_by_id[message.s]
                    ? _this._publicCcxtInstance.markets_by_id[message.s].symbol
                    : message.s,
                id: message.t.toString(),
                order: message.c,
                type: _this.getOrderType(message.o),
                takerOrMaker: message.m ? 'maker' : 'taker',
                side: message.S === 'BUY' ? 'buy' : 'sell',
                price: price,
                amount: amount,
                cost: price * amount,
                fee: {
                    cost: parseFloat(message.n),
                    currency: _this._publicCcxtInstance.safeCurrencyCode(message.N),
                },
            };
        };
        _this.getSpotOrderEventType = function (message) {
            var id = Object.keys(message)[0];
            if (!id) {
                throw new Error('Invalid order message from binance.');
            }
            var newStatus = message.X;
            var originalOrder = _this.getCachedOrder(id);
            if (!newStatus) {
                return exchange_1.OrderEventType.ORDER_UPDATED;
            }
            if (!originalOrder) {
                return exchange_1.OrderEventType.ORDER_CREATED;
            }
            if (newStatus === 'FILLED' && originalOrder.status !== 'closed') {
                return exchange_1.OrderEventType.ORDER_CLOSED;
            }
            else if (newStatus === 'CANCELED' && originalOrder.status !== 'canceled') {
                return exchange_1.OrderEventType.ORDER_CANCELED;
            }
            else if (newStatus === 'REJECTED' && originalOrder.status !== 'failed') {
                return exchange_1.OrderEventType.ORDER_FAILED;
            }
            return exchange_1.OrderEventType.ORDER_UPDATED;
        };
        _this.parseSpotBalance = function (message) {
            var update = { info: message };
            if (!message.B) {
                return undefined;
            }
            for (var _i = 0, _a = message.B; _i < _a.length; _i++) {
                var updateMessage = _a[_i];
                var free = parseFloat(updateMessage.f);
                var used = parseFloat(updateMessage.l);
                var code = _this._ccxtInstance['safeCurrencyCode'](updateMessage.a);
                update[code] = {
                    free: free,
                    used: used,
                    total: free + used,
                };
            }
            return _this._ccxtInstance['parseBalance'](update);
        };
        _this.getFutureOrderId = function (message) {
            var id = message.o.i.toString();
            if (!id) {
                throw new Error('Invalid order message from binance.');
            }
            return id;
        };
        _this.getFutureOrderEventType = function (message) {
            var id = message.o && message.o.i ? message.o.i : undefined;
            if (!id) {
                throw new Error('Invalid order message from binance.');
            }
            var newStatus = message.o.X;
            var originalOrder = _this.getCachedOrder(id);
            if (!newStatus) {
                return exchange_1.OrderEventType.ORDER_UPDATED;
            }
            if (!originalOrder) {
                return exchange_1.OrderEventType.ORDER_CREATED;
            }
            if (newStatus === 'FILLED' && originalOrder.status !== 'closed') {
                return exchange_1.OrderEventType.ORDER_CLOSED;
            }
            else if (newStatus === 'CANCELED' && originalOrder.status !== 'canceled') {
                return exchange_1.OrderEventType.ORDER_CANCELED;
            }
            else if (newStatus === 'REJECTED' && originalOrder.status !== 'failed') {
                return exchange_1.OrderEventType.ORDER_FAILED;
            }
            return exchange_1.OrderEventType.ORDER_UPDATED;
        };
        _this.parseFutureOrder = function (message) {
            var statuses = {
                NEW: 'open',
                PARTIALLY_FILLED: 'open',
                FILLED: 'closed',
                CANCELED: 'canceled',
                PENDING_CANCEL: 'open',
                REJECTED: 'failed',
                EXPIRED: 'canceled',
                REPLACED: 'open',
                STOPPED: 'canceled',
                NEW_INSURANCE: 'open',
                NEW_ADL: 'open',
            };
            var rawOrder = message.o;
            var id = _this.getFutureOrderId(message);
            var originalOrder = _this.getCachedOrder(id);
            var average = parseFloat(rawOrder.ap);
            var amount = parseFloat(rawOrder.q);
            var originalPrice = parseFloat(rawOrder.p);
            var lastFilledPrice = parseFloat(rawOrder.L);
            var filled = parseFloat(rawOrder.l);
            var cost = lastFilledPrice * amount;
            var order = {
                info: message,
                symbol: _this._publicCcxtInstance.markets_by_id[rawOrder.s]
                    ? _this._publicCcxtInstance.markets_by_id[rawOrder.s].symbol
                    : rawOrder.s,
                status: statuses[rawOrder.X],
                price: cost && filled ? cost / filled : originalPrice,
                average: average,
                amount: amount,
                remaining: amount - filled,
                cost: cost,
                datetime: moment_1.default(message.T).toISOString(),
                timestamp: message.T,
                filled: filled,
                side: rawOrder.S === 'BUY' ? 'buy' : 'sell',
                trades: [],
                type: _this.getOrderType(rawOrder.o),
                clientId: rawOrder.c ? rawOrder.c : undefined,
                id: id,
            };
            var mergedOrder = R.mergeDeepWith(function (left, right) { return (right === undefined ? left : right); }, originalOrder, order);
            return mergedOrder;
        };
        _this.parseFutureTrade = function (message) {
            var rawTrade = message.o;
            var price = parseFloat(rawTrade.L);
            var amount = parseFloat(rawTrade.l);
            return {
                info: message,
                timestamp: message.T,
                datetime: moment_1.default(message.T).toISOString(),
                symbol: _this._publicCcxtInstance.markets_by_id[rawTrade.s]
                    ? _this._publicCcxtInstance.markets_by_id[rawTrade.s].symbol
                    : rawTrade.s,
                id: rawTrade.t.toString(),
                order: rawTrade.i.toString(),
                type: _this.getOrderType(rawTrade.o),
                takerOrMaker: rawTrade.m ? 'maker' : 'taker',
                side: rawTrade.S === 'BUY' ? 'buy' : 'sell',
                price: price,
                amount: amount,
                cost: price * amount,
                fee: {
                    cost: rawTrade.n ? parseFloat(rawTrade.n) : 0,
                    currency: _this._publicCcxtInstance.safeCurrencyCode(rawTrade.N),
                },
            };
        };
        _this.parseFuturePositions = function (message) {
            var update = [];
            for (var _i = 0, _a = message.a.P; _i < _a.length; _i++) {
                var rawPosition = _a[_i];
                var amount = parseFloat(rawPosition.pa);
                var unrealizedPnL = parseFloat(rawPosition.up);
                var entryPrice = parseFloat(rawPosition.ep);
                var side = rawPosition.ps.toLowerCase();
                var symbol = _this._publicCcxtInstance.markets_by_id[rawPosition.s]
                    ? _this._publicCcxtInstance.markets_by_id[rawPosition.s].symbol
                    : rawPosition.s;
                var markPrice = 0;
                if (amount !== 0) {
                    markPrice = amount > 0 ? unrealizedPnL / amount + entryPrice : unrealizedPnL / amount - entryPrice;
                }
                update.push({
                    info: rawPosition,
                    symbol: symbol,
                    amount: amount,
                    entryPrice: entryPrice,
                    markPrice: markPrice,
                    side: side,
                });
            }
            return update;
        };
        _this.subscriptionKeyMapping = {};
        _this._publicCcxtInstance = new ccxt_1.default['binance']();
        _this._walletType = _this._walletType || 'spot';
        return _this;
    }
    return binance;
}(base_client_1.BaseClient));
exports.binance = binance;
//# sourceMappingURL=binance.js.map