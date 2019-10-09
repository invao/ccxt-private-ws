# CCXT Private Websockts

A JavaScript library for cryptocurrency trading using authenticated websocket connections.

## Features

- Provides data structure compatibility to [CCXT](https://github.com/ccxt).
- Typescript support
- Missing websocket features are executed via REST API using CCXT

**WARNING** THIS PROJECT IS IN AN EARLY STAGE, HAS NO TESTS AND GIVES YOU NO GUARANTEES ON ANYTHING!

## Supported Exchanges

| Exchange | Orders  | Account  | Notes                                    |
| :------- | :-----: | :------: | :--------------------------------------- |
| Bitfinex | &#9989; | &#10060; |
| Binance  | &#9989; | &#10060; | Order creation/cancellation via REST API |
| Kraken   | &#9989; | &#10060; | Order creation/cancellation via REST API |

## Installation

```sh
yarn install ccxt-private-ws
```

## Subscribing to order stream

Import the library:
```typescript
import * as CcxtPrivateWs from 'ccxt-private-ws';
```

Create an exchange instance using your credentials:
```typescript
const exchange = new CcxtPrivateWs['bitfinex']({ credentials: { apiKey: 'XXX', secret: 'YYY' } });
```

Subscribe the channels you are interested in and start the connection.
```typescript
exchange.subscribeOrders({
  callback: event => console.log(event.type, event.order)
});
exchange.connect();
```

## Creating an order
```typescript
await exchange.createOrder({
    symbol: 'USDT/USD';
    type: 'limit';
    side: 'buy';
    amount: 1;
    price: 1.001;
})
```

## Canceling an order
```typescript
await exchange.createOrder({
    id: 'XXXX-XXXX-XXXX-XXXX';
})
```
