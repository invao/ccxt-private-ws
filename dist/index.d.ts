import 'source-map-support/register';
export { bitfinex } from './exchanges/bitfinex';
export { binance } from './exchanges/binance';
export { kraken } from './exchanges/kraken';
export { ftx } from './exchanges/ftx';
export * from './exchange';
export declare type ExchangeName = 'bitfinex' | 'binance' | 'kraken' | 'ftx';
export declare type ExchangeType = 'bitfinex2' | 'binance' | 'kraken' | 'ftx';
