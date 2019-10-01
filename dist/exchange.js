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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importDefault(require("ws"));
var reconnecting_websocket_1 = __importDefault(require("reconnecting-websocket"));
var unique_random_1 = __importDefault(require("unique-random"));
var ccxt_1 = __importDefault(require("ccxt"));
var OrderEventType;
(function (OrderEventType) {
    OrderEventType["ORDER_CREATED"] = "ORDER_CREATED";
    OrderEventType["ORDER_UPDATED"] = "ORDER_UPDATED";
    OrderEventType["ORDER_CLOSED"] = "ORDER_CLOSED";
})(OrderEventType = exports.OrderEventType || (exports.OrderEventType = {}));
var Exchange = /** @class */ (function () {
    function Exchange(params) {
        var _this = this;
        this.connect = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ccxtInstance.loadMarkets()];
                    case 1:
                        _a.sent();
                        this._connected = new Promise(function (resolve, reject) {
                            _this._ws.addEventListener('open', function () {
                                resolve(true);
                                console.log("Connection to " + _this._name + " established.");
                                if (_this.onOpen) {
                                    _this.onOpen();
                                }
                            });
                            _this._ws.addEventListener('close', function () {
                                resolve(false);
                                console.log("Connection to " + _this._name + " closed.");
                                if (_this.onClose) {
                                    _this.onClose();
                                }
                            });
                            _this._ws.addEventListener('error', function () {
                                resolve(false);
                            });
                            _this._ws.reconnect();
                        });
                        this._ws.addEventListener('message', this._onMessage);
                        return [4 /*yield*/, this.assertConnected()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.disconnect = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._connected = undefined;
                this._ws.close();
                return [2 /*return*/];
            });
        }); };
        this.getName = function () {
            return _this._name;
        };
        this._onMessage = function (event) {
            _this.debug("Event on " + _this.getName() + ": " + event.data);
            _this.onMessage(event);
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
        this._name = params.name;
        this._ws = new reconnecting_websocket_1.default(params.url, [], { WebSocket: ws_1.default, startClosed: true });
        this._credentials = params.credentials;
        this._random = unique_random_1.default(0, Math.pow(2, 45));
        this._debug = params.debug ? true : false;
        this._ccxtInstance = new (__assign({}, ccxt_1.default)[this._name])();
    }
    return Exchange;
}());
exports.Exchange = Exchange;
