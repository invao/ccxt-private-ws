# CCXT Private Websockets

A JavaScript library for cryptocurrency trading using authenticated websocket connections.

## Features

- Provides data structure compatibility to [CCXT](https://github.com/ccxt).
- Typescript support
- Missing websocket features are executed via REST API using CCXT

**WARNING** THIS PROJECT IS IN AN EARLY STAGE, HAS NO TESTS AND GIVES YOU NO GUARANTEES ON ANYTHING!

## Supported Exchanges

| Exchange | Orders  | Account  | Notes                                    |
| :------- | :-----: | :------: | :--------------------------------------- |
| Bitfinex | &#9989; | &#9989;  |
| Binance  | &#9989; | &#9989;  | Order creation/cancellation via REST API |
| Kraken   | &#9989; | &#10060; | Order creation/cancellation via REST API |
| Ftx      | &#9989; | &#10060; | Order creation/cancellation via REST API |

## Installation

```sh
yarn install ccxt-private-ws
```

## Examples

### Subscribing to order stream

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

### Creating an order

```typescript
await exchange.createOrder({
    symbol: 'USDT/USD';
    type: 'limit';
    side: 'buy';
    amount: 1;
    price: 1.001;
})
```

### Canceling an order

```typescript
await exchange.createOrder({
    id: 'XXXX-XXXX-XXXX-XXXX';
})
```

## API

### Exchange Methods

#### `connect(): Promise<void>`

Starts the connection to the exchange and does the authentication.

#### `disconnect(): Promise<void>`

Stops the connection to the exchange.

#### `subscribeOrders(): void`

Enable order update subscription. For each order update an `order` event is emitted. Subscribe to the `order` event using `exchange.on('order, listener)`.

#### `subscribeBalances(): void`

Enable balance update subscription. For each balance update a `balance` event is emitted. Subscribe to the `balance` event using `exchange.on('balance, listener)`.

#### `createOrder?({ order }: { order: OrderInput }): Promise<void>`

Creates an order.

#### `cancelOrder?({ id }: { id: string }): Promise<void>`

Cancels an order.

#### `createClientId?(): string`

Creates an exchange compliant order client id that can be used when calling `createOrder`.

#### `getName(): string`

Returns the lowercase exchange name.

### Exchange Events

#### `on(event: 'order', listener: OrderListener): void`

Emitted when an order update is received. The listener event contains the full order that has been aggregated over all subsequent updates.

#### `on(event: 'balance', listener: BalanceListener): void`

Emitted when a balance update is received. The listener event might only contain the updated balances but will always contain current values for `total`, `used` and `free`.

#### `on(event: 'fullBalance', listener: BalanceListener): void`

Emitted when a balance update is received. This always contains all account balances for the specific exchange. Some exchanges might only send `balance` events.

#### `on(event: 'connect', listener: ConnectListener): void`

Emitted when the websocket connection was established and the authentication succeeded.
