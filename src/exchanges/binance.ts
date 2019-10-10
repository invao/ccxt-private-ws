import {
  ExchangeCredentials,
  OrderInput,
  OrderExecutionType,
  Order,
  OrderEventType,
  OrderStatus,
  Trade
} from '../exchange';
import ccxt from 'ccxt';
import * as R from 'ramda';
import uniqueRandom from 'unique-random';
import moment from 'moment';
import { BaseClient } from '../base-client';

enum BinanceOrderExecutionType {
  NEW = 'NEW',
  CANCELED = 'CANCELED',
  REPLACED = 'REPLACED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

enum BinanceOrderStatus {
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  PENDING_CANCEL = 'PENDING_CANCEL',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

type BinanceMessage = BinanceOrderMessage | BinanceTradeMessage;
type BinanceTradeMessage = BinanceOrderMessage & { x: 'TRADE ' };
type BinanceOrderMessage = {
  e: 'executionReport'; // Event type
  E: number; // Event time
  s: string; // Symbol
  c: string; // Client order ID
  S: 'BUY' | 'SELL'; // Side
  o: 'LIMIT'; // Order type
  f: 'GTC'; // Time in force
  q: string; // Order quantity
  p: string; // Order price
  P: string; // Stop price
  F: string; // Iceberg quantity
  g: number; // OrderListId
  C: string; // Original client order ID; This is the ID of the order being canceled
  x: BinanceOrderExecutionType; // Current execution type
  X: BinanceOrderStatus; // Current order status
  r: string; // Order reject reason; will be an error code.
  i: number; // Order ID
  l: string; // Last executed quantity
  z: string; // Cumulative filled quantity
  L: string; // Last executed price
  n: string; // Commission amount
  N: null; // Commission asset
  T: number; // Transaction time
  t: number; // Trade ID
  I: number; // Ignore
  w: boolean; // Is the order working? Stops will have
  m: boolean; // Is this trade the maker side?
  M: boolean; // Ignore
  O: number; // Order creation time
  Z: string; // Cumulative quote asset transacted quantity
  Y: string; // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
};

type BinanceConstructorParams = {
  credentials: ExchangeCredentials;
};

const isBinanceOrderMessage = (message: BinanceMessage): message is BinanceOrderMessage => {
  return (
    (message as BinanceOrderMessage).e === 'executionReport' &&
    ((message as BinanceOrderMessage).x as string) !== 'TRADE'
  );
};

const isBinanceTradeMessage = (message: BinanceMessage): message is BinanceTradeMessage => {
  return (
    (message as BinanceTradeMessage).e === 'executionReport' && (message as BinanceTradeMessage).x === 'TRADE'
  );
};

export class binance extends BaseClient {
  private _publicCcxtInstance: ccxt.Exchange;
  constructor(params: BinanceConstructorParams) {
    super({ ...params, url: '', name: 'binance' });
    this.subscriptionKeyMapping = {};
    this._publicCcxtInstance = new ccxt['binance']();
  }

  protected onMessage = async (event: MessageEvent) => {
    const data: BinanceMessage = JSON.parse(event.data);

    if (isBinanceOrderMessage(data)) {
      const orderId = this.getOrderId(data);
      await this.lock.acquire(orderId, async () => {
        const type = this.getOrderEventType(data);
        const order = await this.parseOrder(data);
        await this.saveCachedOrder(order);
        await this.updateFeeFromTrades({ orderId });
        this.onOrder({ type, order: this.getCachedOrder(orderId) });
      });
    } else if (isBinanceTradeMessage(data)) {
      const orderId = this.getOrderId(data);
      await this.lock.acquire(orderId, async () => {
        const type = this.getOrderEventType(data);
        const order = await this.parseOrder(data);
        await this.saveCachedOrder(order);
        const trade = await this.parseTrade(data);
        await this.saveCachedTrade({ trade, orderId });
        await this.updateFeeFromTrades({ orderId });
        this.onOrder({ type, order: this.getCachedOrder(orderId) });
      });
    }
  };

  private _doAuth = async () => {
    await this._publicCcxtInstance.loadMarkets();
    const ccxtInstance = new ccxt['binance']({ ...this.getCredentials() });
    const data = await ccxtInstance.publicPostUserDataStream();

    const listenKey = data.listenKey;
    this.setUrl(`wss://stream.binance.com:9443/ws/${listenKey}`);
  };

  public onConnect = async () => {
    await this._doAuth();
  };

  protected onOpen = async () => {};

  public createOrder = async ({ order }: { order: OrderInput }) => {
    const ccxtInstance = new ccxt['binance']({ ...this.getCredentials() });

    const options: any = {};
    if (order.clientId) {
      options['newClientOrderId'] = parseInt(order.clientId);
    }
    const result: Order = await ccxtInstance.createOrder(
      order.symbol,
      'limit',
      order.side,
      order.amount,
      order.price,
      options
    );
    await this.saveCachedOrder(result);
  };

  private getOrderId = (message: BinanceOrderMessage) => {
    const id = message.i.toString();

    if (!id) {
      throw new Error('Invalid order message from binance.');
    }

    return id;
  };

  private getOrderType = (type: 'LIMIT' | 'MARKET'): OrderExecutionType => {
    const types: Record<'LIMIT' | 'MARKET', OrderExecutionType> = {
      LIMIT: 'limit',
      MARKET: 'market'
    };

    return types[type];
  }
  private parseOrder = (message: BinanceOrderMessage): Order => {
    const statuses: Record<BinanceOrderStatus, OrderStatus> = {
      NEW: 'open',
      PARTIALLY_FILLED: 'open',
      FILLED: 'closed',
      CANCELED: 'canceled',
      PENDING_CANCEL: 'open', // currently unused
      REJECTED: 'failed',
      EXPIRED: 'canceled'
    };

    const id = this.getOrderId(message);
    const originalOrder = this.getCachedOrder(id);

    const cost = parseFloat(message.Z);
    const filled = parseFloat(message.z);
    const amount = parseFloat(message.q);
    const order: Order = {
      amount,
      cost,
      average: cost / filled,
      datetime: moment(message.T).toISOString(),
      timestamp: message.T,
      filled: parseFloat(message.z),
      info: message,
      price: cost && filled ? cost / filled : parseFloat(message.p),
      remaining: amount - filled,
      side: message.S === 'BUY' ? 'buy' : 'sell',
      status: statuses[message.X],
      symbol: this._publicCcxtInstance.findSymbol(message.s),
      trades: [],
      type: this.getOrderType(message.o),
      clientId: message.c,
      id
    };

    const mergedOrder = R.mergeDeepWith(
      (left, right) => (right === undefined ? left : right),
      originalOrder,
      order
    );

    return mergedOrder;
  };

  private parseTrade = (message: BinanceTradeMessage): Trade => {
    const price = parseFloat(message.L);
    const amount = parseFloat(message.l);
    return {
      info: message,
      timestamp: message.T,
      datetime: moment(message.T).toISOString(),
      symbol:  this._publicCcxtInstance.findSymbol(message.s),
      id: message.t.toString(),
      order: message.c,
      type: this.getOrderType(message.o),
      takerOrMaker: message.m ? 'maker' : 'taker',
      side: message.S === 'BUY' ? 'buy' : 'sell',
      price,
      amount,
      cost: price * amount,
      fee: {
        cost: parseFloat(message.n),
        currency: this._publicCcxtInstance.safeCurrencyCode(message.N)
      }
    };
  };

  private getOrderEventType = (message: BinanceOrderMessage) => {
    const id = Object.keys(message)[0];

    if (!id) {
      throw new Error('Invalid order message from binance.');
    }

    const newStatus = message.X;
    const originalOrder = this.getCachedOrder(id);

    if (!newStatus) {
      return OrderEventType.ORDER_UPDATED;
    }

    if (!originalOrder) {
      return OrderEventType.ORDER_CREATED;
    }

    if( newStatus === 'FILLED' && originalOrder.status !== 'closed') {
      return OrderEventType.ORDER_CLOSED;
    } else if( newStatus === 'CANCELED' && originalOrder.status !== 'canceled') {
      return OrderEventType.ORDER_CANCELED;
    } else if( newStatus === 'REJECTED' && originalOrder.status !== 'failed') {
      return OrderEventType.ORDER_FAILED;
    }

    return OrderEventType.ORDER_UPDATED;
  };

  public cancelOrder = async ({ id }: { id: string }) => {
    const ccxtInstance = new ccxt['binance']({ ...this.getCredentials() });

    const order = this.getCachedOrder(id);
    await ccxtInstance.cancelOrder(id, order.symbol);
  };

  public createClientId = () => {
    return this._random().toString();
  };
}
