import 'source-map-support/register';
export { bitfinex } from './exchanges/bitfinex';
export { binance } from './exchanges/binance';
export { kraken } from './exchanges/kraken';
export * from './exchange';
export declare type ExchangeName = 'bitfinex' | 'binance' | 'kraken';
