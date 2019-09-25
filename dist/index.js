"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var bitfinex_1 = require("./exchanges/bitfinex");
exports.bitfinex = bitfinex_1.bitfinex;
__export(require("./exchange"));
