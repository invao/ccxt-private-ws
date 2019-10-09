"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
var ws_1 = __importDefault(require("ws"));
var reconnecting_websocket_1 = __importDefault(require("reconnecting-websocket"));
var unique_random_1 = __importDefault(require("unique-random"));
var ccxt_1 = __importDefault(require("ccxt"));
var R = __importStar(require("ramda"));
var async_lock_1 = __importDefault(require("async-lock"));
var domain_1 = __importDefault(require("domain"));
var OrderEventType;
(function (OrderEventType) {
    OrderEventType["ORDER_CREATED"] = "ORDER_CREATED";
    OrderEventType["ORDER_UPDATED"] = "ORDER_UPDATED";
    OrderEventType["ORDER_CLOSED"] = "ORDER_CLOSED";
    OrderEventType["ORDER_CANCELED"] = "ORDER_CANCELED";
    OrderEventType["ORDER_FAILED"] = "ORDER_FAILED";
})(OrderEventType = exports.OrderEventType || (exports.OrderEventType = {}));
var Exchange = /** @class */ (function () {
    function Exchange(params) {
        var _this = this;
        this.send = function (message) {
            console.log("Sending message to " + _this.getName() + ": " + message);
            if (_this._ws) {
                _this._ws.send(message);
            }
            else {
                throw new Error('Websocket not connected.');
            }
        };
        this.getCredentials = function () {
            if (typeof _this._credentials === 'function') {
                return _this._credentials();
            }
            else {
                return _this._credentials;
            }
        };
        this.connect = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.onConnect) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.onConnect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this._ws) {
                            this._ws.close();
                        }
                        if (!this._url) {
                            throw new Error('Websocket url missing.');
                        }
                        this._ws = new reconnecting_websocket_1.default(this._url, [], { WebSocket: ws_1.default, startClosed: true });
                        return [4 /*yield*/, this._ccxtInstance.loadMarkets()];
                    case 3:
                        _a.sent();
                        this._connected = new Promise(function (resolve, reject) {
                            if (!_this._ws) {
                                throw new Error('Websocket not connected.');
                            }
                            _this._resolveConnect = resolve;
                            _this._ws.addEventListener('open', _this._onOpen);
                            _this._ws.addEventListener('close', _this._onClose);
                            _this._ws.addEventListener('error', _this._onError);
                            _this._ws.reconnect();
                        });
                        this._ws.addEventListener('message', this._onMessage);
                        return [4 /*yield*/, this.assertConnected()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.disconnect = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._connected = undefined;
                if (!this._ws) {
                    throw new Error('Websocket not connected.');
                }
                this._ws.close();
                this._ws.removeEventListener('message', this._onMessage);
                this._ws.removeEventListener('open', this._onOpen);
                this._ws.removeEventListener('close', this._onClose);
                this._ws.removeEventListener('error', this._onError);
                return [2 /*return*/];
            });
        }); };
        this.getName = function () {
            return _this._name;
        };
        this._onMessage = function (event) {
            _this.debug("Event on " + _this.getName() + ": " + event.data);
            domain_1.default.create().run(function () {
                _this.onMessage(event);
            });
        };
        this._onOpen = function () {
            if (_this._resolveConnect) {
                _this._resolveConnect(true);
            }
            console.log("Connection to " + _this._name + " established at " + _this._url + ".");
            if (_this.onOpen) {
                _this.onOpen();
            }
        };
        this._onClose = function () {
            if (_this._resolveConnect) {
                _this._resolveConnect(false);
            }
            console.log("Connection to " + _this._name + " closed.");
            if (_this.onClose) {
                _this.onClose();
            }
        };
        this._onError = function () {
            if (_this._resolveConnect) {
                _this._resolveConnect(false);
            }
        };
        this.assertConnected = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._connected];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error(this._name + " not connected.");
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.setOrderCallback = function (callback) {
            _this._orderCallback = callback;
        };
        this.subscribeOrders = function (_a) {
            var callback = _a.callback;
            _this._subscribeFilter = R.uniq(__spreadArrays(_this._subscribeFilter, [_this.subscriptionKeyMapping['orders']]));
            if (_this._ws) {
                _this._ws.reconnect();
            }
            _this.setOrderCallback(callback);
        };
        this.onOrder = function (event) {
            if (_this._orderCallback) {
                _this._orderCallback(event);
            }
        };
        this.debug = function (message) {
            if (_this._debug) {
                console.log(message);
            }
        };
        this.getCachedOrder = function (id) {
            return _this._orders[id];
        };
        this.saveCachedOrder = function (order) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.lock.acquire(order.id, function () {
                            if (!_this._orders[order.id]) {
                                _this._orders[order.id] = order;
                            }
                            else {
                                _this._orders[order.id] = __assign(__assign({}, order), { trades: _this._orders[order.id].trades });
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.saveCachedTrade = function (_a) {
            var trade = _a.trade, orderId = _a.orderId;
            return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.lock.acquire(orderId, function () {
                                if (!_this._orders[orderId]) {
                                    _this._orders[orderId] = {
                                        id: orderId,
                                        amount: 0,
                                        average: 0,
                                        cost: 0,
                                        datetime: '',
                                        filled: 0,
                                        price: 0,
                                        remaining: 0,
                                        side: 'buy',
                                        status: 'unknown',
                                        symbol: '',
                                        timestamp: 0,
                                        type: undefined
                                    };
                                }
                                var order = _this._orders[orderId];
                                if (!order.trades) {
                                    order.trades = [trade];
                                }
                                else {
                                    var originalTradeIndex = R.findIndex(function (t) { return t.id === trade.id; }, order.trades);
                                    if (originalTradeIndex === -1) {
                                        order.trades.push(trade);
                                    }
                                    else {
                                        order.trades[originalTradeIndex] = trade;
                                    }
                                }
                                return order;
                            })];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        this.setUrl = function (url) {
            _this._url = url;
        };
        this.updateFeeFromTrades = function (_a) {
            var orderId = _a.orderId;
            return __awaiter(_this, void 0, void 0, function () {
                var fee, order, trades, _i, trades_1, trade;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.getCachedOrder(orderId)) {
                                throw new Error('Order does not exist.');
                            }
                            fee = undefined;
                            order = this.getCachedOrder(orderId);
                            trades = order.trades;
                            if (trades) {
                                for (_i = 0, trades_1 = trades; _i < trades_1.length; _i++) {
                                    trade = trades_1[_i];
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
                            return [4 /*yield*/, this.saveCachedOrder(__assign(__assign({}, order), { fee: fee }))];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        this._name = params.name;
        this._url = params.url;
        this._credentials = params.credentials;
        this._random = unique_random_1.default(0, Math.pow(2, 31));
        this._debug = params.debug ? true : false;
        this._ccxtInstance = new (__assign({}, ccxt_1.default)[this._name])();
        this._subscribeFilter = [];
        this.subscriptionKeyMapping = {};
        this._orders = {};
        this.lock = new async_lock_1.default({ domainReentrant: true });
        this.lockDomain = domain_1.default.create();
    }
    return Exchange;
}());
exports.Exchange = Exchange;
//# sourceMappingURL=exchange.js.map