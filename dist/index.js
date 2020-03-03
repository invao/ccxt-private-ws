"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
var bitfinex_1 = require("./exchanges/bitfinex");
exports.bitfinex = bitfinex_1.bitfinex;
var binance_1 = require("./exchanges/binance");
exports.binance = binance_1.binance;
var kraken_1 = require("./exchanges/kraken");
exports.kraken = kraken_1.kraken;
var ftx_1 = require("./exchanges/ftx");
exports.ftx = ftx_1.ftx;
__export(require("./exchange"));
//# sourceMappingURL=index.js.map