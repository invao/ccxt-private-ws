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
var exchange_1 = require("../exchange");
var ccxt_1 = __importDefault(require("ccxt"));
var R = __importStar(require("ramda"));
var isKrakenOpenOrdersMessage = function (message) {
    return message[1] === 'openOrders';
};
var kraken = /** @class */ (function (_super) {
    __extends(kraken, _super);
    function kraken(params) {
        var _this = _super.call(this, __assign(__assign({}, params), { url: 'wss://beta-ws.kraken.com/', name: 'kraken' })) || this;
        _this.onMessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var data, _loop_1, this_1, _i, _a, message;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = JSON.parse(event.data);
                        if (!isKrakenOpenOrdersMessage(data)) return [3 /*break*/, 4];
                        _loop_1 = function (message) {
                            var id;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        id = this_1.getOrderId(message);
                                        return [4 /*yield*/, this_1.lock.acquire(id, function () { return __awaiter(_this, void 0, void 0, function () {
                                                var type, order;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            type = this.getOrderEventType(message);
                                                            return [4 /*yield*/, this.parseOrder(message)];
                                                        case 1:
                                                            order = _a.sent();
                                                            return [4 /*yield*/, this.saveCachedOrder(order)];
                                                        case 2:
                                                            _a.sent();
                                                            this.onOrder({ type: type, order: this.getCachedOrder(order.id) });
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = data[0];
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        message = _a[_i];
                        return [5 /*yield**/, _loop_1(message)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        _this._doAuth = function () { return __awaiter(_this, void 0, void 0, function () {
            var getWebsocketsTokenUrl, ccxtInstance, data, token, _i, _a, filter;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        getWebsocketsTokenUrl = 'GetWebSocketsToken';
                        return [4 /*yield*/, this._publicCcxtInstance.loadMarkets()];
                    case 1:
                        _b.sent();
                        ccxtInstance = new ccxt_1.default['kraken'](__assign({}, this.getCredentials()));
                        return [4 /*yield*/, ccxtInstance.fetch2(getWebsocketsTokenUrl, 'private', 'POST', undefined, undefined, undefined)];
                    case 2:
                        data = _b.sent();
                        token = data.result.token;
                        for (_i = 0, _a = this._subscribeFilter; _i < _a.length; _i++) {
                            filter = _a[_i];
                            this.send(JSON.stringify({ event: 'subscribe', subscription: { name: filter, token: token } }));
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        _this.onOpen = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._doAuth()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.createOrder = function (_a) {
            var order = _a.order;
            return __awaiter(_this, void 0, void 0, function () {
                var ccxtInstance, options, result;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            ccxtInstance = new ccxt_1.default['kraken'](__assign({}, this.getCredentials()));
                            options = {};
                            if (order.clientId) {
                                options['userref'] = parseInt(order.clientId);
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
        _this.getOrderId = function (message) {
            var id = Object.keys(message)[0];
            if (!id) {
                throw new Error('Invalid order message from kraken.');
            }
            return id;
        };
        _this.parseOrder = function (message) { return __awaiter(_this, void 0, void 0, function () {
            var id, originalOrder, krakenOrder, symbol, order, mergedOrder;
            return __generator(this, function (_a) {
                id = this.getOrderId(message);
                originalOrder = this.getCachedOrder(id);
                krakenOrder = message[id];
                if (originalOrder) {
                    symbol = originalOrder.symbol;
                }
                else if (krakenOrder.descr) {
                    symbol = krakenOrder.descr.pair;
                }
                if (krakenOrder.descr) {
                    krakenOrder.descr.pair = undefined; // ccxt generates DAI//USD instead of DAI/USD as symbol
                }
                order = __assign(__assign({}, this._publicCcxtInstance.parseOrder(__assign(__assign({}, (originalOrder ? originalOrder.info : {})), krakenOrder), symbol ? this._publicCcxtInstance.findMarket(symbol) : undefined)), { clientId: krakenOrder.userref ? krakenOrder.userref.toString() : undefined, id: id });
                mergedOrder = R.mergeDeepWith(function (left, right) { return (right === undefined ? left : right); }, originalOrder, order);
                return [2 /*return*/, mergedOrder];
            });
        }); };
        _this.getOrderEventType = function (message) {
            var id = Object.keys(message)[0];
            if (!id) {
                throw new Error('Invalid order message from kraken.');
            }
            var krakenOrder = message[id];
            var newStatus = krakenOrder.status;
            var originalOrder = _this.getCachedOrder(id);
            var originalStatus = originalOrder ? originalOrder.status : undefined;
            if (!newStatus) {
                return exchange_1.OrderEventType.ORDER_UPDATED;
            }
            if (!originalOrder) {
                return exchange_1.OrderEventType.ORDER_CREATED;
            }
            if (newStatus !== originalStatus) {
                switch (newStatus) {
                    case 'pending':
                    case 'open':
                        return exchange_1.OrderEventType.ORDER_UPDATED;
                    case 'close':
                        return exchange_1.OrderEventType.ORDER_CLOSED;
                    case 'canceled':
                        return exchange_1.OrderEventType.ORDER_CANCELED;
                    case 'expired':
                        return exchange_1.OrderEventType.ORDER_CANCELED;
                }
            }
            return exchange_1.OrderEventType.ORDER_UPDATED;
        };
        _this.cancelOrder = function (_a) {
            var id = _a.id;
            return __awaiter(_this, void 0, void 0, function () {
                var ccxtInstance;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            ccxtInstance = new ccxt_1.default['kraken'](__assign({}, this.getCredentials()));
                            return [4 /*yield*/, ccxtInstance.cancelOrder(id)];
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
        _this.subscriptionKeyMapping = {
            orders: 'openOrders'
        };
        _this._publicCcxtInstance = new ccxt_1.default['kraken']();
        return _this;
    }
    return kraken;
}(exchange_1.Exchange));
exports.kraken = kraken;
//# sourceMappingURL=kraken.js.map