import ccxt from 'ccxt';
import moment from 'moment';
import * as R from 'ramda';

import { BaseClient } from '../base-client';
import {
  BalanceUpdate,
  ExchangeCredentials,
  Order,
  OrderEventType,
  OrderExecutionType,
  OrderInput,
  OrderStatus,
  PositionUpdate,
  Trade,
  WalletType,
} from '../exchange';

type BinanceConstructorParams = {
  credentials: ExchangeCredentials;
};

enum BinanceSpotOrderExecutionType {
  NEW = 'NEW',
  CANCELED = 'CANCELED',
  REPLACED = 'REPLACED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  TRADE = 'TRADE',
}

enum BinanceSpotOrderStatus {
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  PENDING_CANCEL = 'PENDING_CANCEL',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

type BinanceSpotMessage =
  | BinanceSpotOrderMessage
  | BinanceSpotTradeMessage
  | BinanceSpotAccountInfoMessage
  | BinanceSpotAccountPositionMessage;

type BinanceSpotAccountPositionMessage = {
  e: 'outboundAccountPosition'; // Event type
  E: number; // Event time
  u?: number; // Time of last account update
  B?: {
    a: string; // Asset
    f: string; // Free amount
    l: string; // Locked amount
  }[];
};

type BinanceSpotAccountInfoMessage = {
  e: 'outboundAccountInfo'; // Event type
  E: number; // Event time
  m?: number; // Maker commission rate (bips)
  t?: number; // Taker commission rate (bips)
  b?: number; // Buyer commission rate (bips)
  s?: number; // Seller commission rate (bips)
  T?: boolean; // Can trade?
  W?: boolean; // Can withdraw?
  D?: boolean; // Can deposit?
  u?: number; // Time of last account update
  B?: {
    a: string; // Asset
    f: string; // Free amount
    l: string; // Locked amount
  }[];
};

type BinanceSpotTradeMessage = BinanceSpotOrderMessage & { x: BinanceSpotOrderExecutionType.TRADE };
type BinanceSpotOrderMessage = {
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
  x: BinanceSpotOrderExecutionType; // Current execution type
  X: BinanceSpotOrderStatus; // Current order status
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

enum BinanceFutureOrderExecutionType {
  NEW = 'NEW',
  PARTIAL_FILL = 'PARTIAL_FILL',
  FILL = 'FILL',
  CANCELED = 'CANCELED',
  PENDING_CANCEL = 'PENDING_CANCEL',
  REJECTED = 'REJECTED',
  CALCULATED = 'CALCULATED', // Liquidation Execution
  EXPIRED = 'EXPIRED',
  TRADE = 'TRADE',
  RESTATED = 'RESTATED',
}

enum BinanceFutureOrderStatus {
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  PENDING_CANCEL = 'PENDING_CANCEL',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REPLACED = 'REPLACED',
  STOPPED = 'STOPPED',
  NEW_INSURANCE = 'NEW_INSURANCE', // Liquidation with Insurance Fund
  NEW_ADL = 'NEW_ADL', // Counterparty Liquidation
}

type BinanceFutureMessage =
  | BinanceFutureOrderMessage
  | BinanceFutureTradeMessage
  | BinanceFutureAccountInfoMessage;

type BinanceFutureAccountInfoMessage = {
  e: 'ACCOUNT_UPDATE'; // Event type
  E: number; // Event time
  a: {
    B: BinanceFutureBalanceMessage[];
    P: BinanceFuturePositionMessage[];
  };
};

type BinanceFutureBalanceMessage = {
  a: string; // Asset
  wb: string; // Wallet Balance
  cw: string; // Cross Wallet Balance
};

type BinanceFuturePositionMessage = {
  s: string; // Symbol
  pa: string; // Position Amount
  ep: string; // Entry Price
  cr: string; // (Pre-fee) accumulated realized
  up: string; // Unrealized PnL
  mt: string; // Margin Type
  iw: string; // Isolated Wallet (if isolated position)
  ps: string; // Position Side
};

type BinanceFutureTradeMessage = BinanceFutureOrderMessage & {
  o: BinanceFutureOrderObject & { x: BinanceFutureOrderExecutionType.TRADE };
};
type BinanceFutureOrderMessage = {
  e: 'ORDER_TRADE_UPDATE'; // Event type
  E: number; // Event time
  T: number; // Transaction Time
  o: BinanceFutureOrderObject;
};
type BinanceFutureOrderObject = {
  s: string; // Symbol
  c: string; // Client order ID
  S: 'BUY' | 'SELL'; // Side
  o: 'MARKET' | 'LIMIT' | 'STOP'; // Order type
  f: 'GTC'; // Time in force
  q: string; // Order quantity
  p: string; // Order price
  ap: string; // Average price
  sp: string; // Stop price
  ps: string; // Position side
  x: BinanceFutureOrderExecutionType; // Current execution type
  X: BinanceFutureOrderStatus; // Current order status
  i: number; // Order ID
  l: string; // Order Last Filled Quantity
  z: string; // Order Filled Accumulated Quantity
  L: string; // Last Filled Price
  N: string | null; // Commission Asset (Will not push if no commission)
  n: string | null; // Commission amount (Will not push if no commission)
  T: number; // Transaction time
  t: number; // Trade Id
  b: number; // Bids Notional
  a: number; // Ask Notional
  m: boolean; // Is this trade the maker side?
  R: boolean; // Is this reduce only
  wt: string; // stop price working type
  cp: boolean; // If Close-All, pushed with conditional order
  AP: string; // Activation Price, only puhed with TRAILING_STOP_MARKET order
  cr: string; // Callback Rate, only puhed with TRAILING_STOP_MARKET order
  ot: string; // Original type
};

const isBinanceSpotOrderMessage = (message: BinanceSpotMessage): message is BinanceSpotOrderMessage => {
  return (
    (message as BinanceSpotOrderMessage).e === 'executionReport' &&
    ((message as BinanceSpotOrderMessage).x as string) !== 'TRADE'
  );
};

const isBinanceSpotTradeMessage = (message: BinanceSpotMessage): message is BinanceSpotTradeMessage => {
  return (
    (message as BinanceSpotTradeMessage).e === 'executionReport' &&
    (message as BinanceSpotTradeMessage).x === 'TRADE'
  );
};

const isBinanceSpotAccountInfoMessage = (
  message: BinanceSpotMessage
): message is BinanceSpotAccountInfoMessage => {
  return (message as BinanceSpotAccountInfoMessage).e === 'outboundAccountInfo';
};

const isBinanceSpotAccountPositionMessage = (
  message: BinanceSpotMessage
): message is BinanceSpotAccountPositionMessage => {
  return (message as BinanceSpotAccountPositionMessage).e === 'outboundAccountPosition';
};

const isBinanceFutureOrderMessage = (message: BinanceFutureMessage): message is BinanceFutureOrderMessage => {
  return (
    (message as BinanceFutureOrderMessage).e === 'ORDER_TRADE_UPDATE' &&
    ((message as BinanceFutureOrderMessage).o.x as string) !== 'TRADE'
  );
};

const isBinanceFutureTradeMessage = (message: BinanceFutureMessage): message is BinanceFutureTradeMessage => {
  return (
    (message as BinanceFutureTradeMessage).e === 'ORDER_TRADE_UPDATE' &&
    (message as BinanceFutureTradeMessage).o.x === 'TRADE'
  );
};

const isBinanceFutureAccountInfoMessage = (
  message: BinanceFutureMessage
): message is BinanceFutureAccountInfoMessage => {
  return (message as BinanceFutureAccountInfoMessage).e === 'ACCOUNT_UPDATE';
};

export class binance extends BaseClient {
  private _publicCcxtInstance: ccxt.Exchange;
  private _keepAliveInterval?: NodeJS.Timeout;
  private _listenKey?: string;

  constructor(params: BinanceConstructorParams) {
    super({ ...params, url: '', name: 'binance' });
    this.subscriptionKeyMapping = {};
    this._publicCcxtInstance = new ccxt['binance']();
    this._walletType = this._walletType || 'spot';
  }

  protected onMessage = async (event: MessageEvent) => {
    switch (this._walletType) {
      case 'spot':
        return await this.onSpotMessages(event);
      case 'future':
        return await this.onFutureMessages(event);
    }
  };

  private onSpotMessages = async (event: MessageEvent) => {
    const data: BinanceSpotMessage = JSON.parse(event.data);

    if (isBinanceSpotOrderMessage(data)) {
      const orderId = this.getSpotOrderId(data);
      await this.lock.acquire(orderId, async () => {
        const type = this.getSpotOrderEventType(data);
        const order = await this.parseSpotOrder(data);
        await this.saveCachedOrder(order);
        await this.updateFeeFromTrades({ orderId });
        this.onOrder({ type, order: this.getCachedOrder(orderId) });
      });
    } else if (isBinanceSpotTradeMessage(data)) {
      const orderId = this.getSpotOrderId(data);
      await this.lock.acquire(orderId, async () => {
        const type = this.getSpotOrderEventType(data);
        const order = await this.parseSpotOrder(data);
        await this.saveCachedOrder(order);
        const trade = await this.parseSpotTrade(data);
        await this.saveCachedTrade({ trade, orderId });
        await this.updateFeeFromTrades({ orderId });
        this.onOrder({ type, order: this.getCachedOrder(orderId) });
      });
    } else if (isBinanceSpotAccountInfoMessage(data)) {
      const balance = this.parseSpotBalance(data);
      if (balance) {
        this.emit('fullBalance', { update: balance });
      }
    } else if (isBinanceSpotAccountPositionMessage(data)) {
      const balance = this.parseSpotBalance(data);
      if (balance) {
        this.emit('balance', { update: balance });
      }
    }
  };

  private onFutureMessages = async (event: MessageEvent) => {
    const { data }: any = JSON.parse(event.data);

    if (isBinanceFutureOrderMessage(data) || isBinanceFutureTradeMessage(data)) {
      const orderId = this.getFutureOrderId(data);
      await this.lock.acquire(orderId, async () => {
        const type = this.getFutureOrderEventType(data);
        const order = await this.parseFutureOrder(data);
        await this.saveCachedOrder(order);
        await this.updateFeeFromTrades({ orderId });
        this.onOrder({ type, order: this.getCachedOrder(orderId) });
      });
    } else if (isBinanceFutureTradeMessage(data)) {
      const orderId = this.getFutureOrderId(data);
      await this.lock.acquire(orderId, async () => {
        const type = this.getFutureOrderEventType(data);
        const order = await this.parseFutureOrder(data);
        await this.saveCachedOrder(order);
        const trade = await this.parseFutureTrade(data);
        await this.saveCachedTrade({ trade, orderId });
        await this.updateFeeFromTrades({ orderId });
        this.onOrder({ type, order: this.getCachedOrder(orderId) });
      });
    } else if (isBinanceFutureAccountInfoMessage(data)) {
      const positions = this.parseFuturePositions(data);
      if (positions.length) {
        this.emit('positions', { update: positions });
      }
    }
  };

  private _keepAlive = async () => {
    const ccxtInstance = new ccxt['binance']({ ...this.getCredentials() });
    await ccxtInstance.publicPutUserDataStream({ listenKey: this._listenKey });
  };

  private _doAuth = async () => {
    await this._publicCcxtInstance.loadMarkets();
    const ccxtInstance = new ccxt['binance']({ ...this.getCredentials() });

    if (!this._keepAliveInterval) {
      this._keepAliveInterval = setInterval(this._keepAlive, 1000 * 60 * 30);
    }

    let endpoint = undefined;
    switch (this._walletType) {
      case 'future':
        const futureDataStream = await ccxtInstance.fapiPrivatePostListenKey();
        this._listenKey = futureDataStream.listenKey;
        endpoint = `wss://fstream.binance.com/stream?streams=${this._listenKey}`;
        break;
      case 'spot':
      default:
        const spotDataStream = await ccxtInstance.publicPostUserDataStream();
        this._listenKey = spotDataStream.listenKey;
        endpoint = `wss://stream.binance.com:9443/ws/${this._listenKey}`;
        break;
    }

    this.setUrl(endpoint);  
  };

  protected preConnect = async () => {
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

  public cancelOrder = async ({ id }: { id: string }) => {
    const ccxtInstance = new ccxt['binance']({ ...this.getCredentials() });

    const order = this.getCachedOrder(id);
    await ccxtInstance.cancelOrder(id, order.symbol);
  };

  public createClientId = () => {
    return this._random().toString();
  };

  private getOrderType = (type: 'LIMIT' | 'MARKET' | 'STOP'): OrderExecutionType => {
    return type.toLocaleLowerCase();
  };

  private getSpotOrderId = (message: BinanceSpotOrderMessage) => {
    const id = message.i.toString();

    if (!id) {
      throw new Error('Invalid order message from binance.');
    }

    return id;
  };

  private parseSpotOrder = (message: BinanceSpotOrderMessage): Order => {
    const statuses: Record<BinanceSpotOrderStatus, OrderStatus> = {
      NEW: 'open',
      PARTIALLY_FILLED: 'open',
      FILLED: 'closed',
      CANCELED: 'canceled',
      PENDING_CANCEL: 'open', // currently unused
      REJECTED: 'failed',
      EXPIRED: 'canceled',
    };

    const id = this.getSpotOrderId(message);
    const originalOrder = this.getCachedOrder(id);

    const cost = parseFloat(message.Z);
    const filled = parseFloat(message.z);
    const amount = parseFloat(message.q);
    const order: Order = {
      amount,
      cost,
      datetime: moment(message.T).toISOString(),
      timestamp: message.T,
      filled: parseFloat(message.z),
      info: message,
      price: cost && filled ? cost / filled : parseFloat(message.p),
      remaining: amount - filled,
      side: message.S === 'BUY' ? 'buy' : 'sell',
      status: statuses[message.X],
      symbol: this._publicCcxtInstance.markets_by_id[message.s]
        ? this._publicCcxtInstance.markets_by_id[message.s].symbol
        : message.s,
      trades: [],
      type: this.getOrderType(message.o),
      clientId: message.c ? message.c : undefined,
      id,
    };

    const mergedOrder = R.mergeDeepWith(
      (left, right) => (right === undefined ? left : right),
      originalOrder,
      order
    );

    return mergedOrder;
  };

  private parseSpotTrade = (message: BinanceSpotTradeMessage): Trade => {
    const price = parseFloat(message.L);
    const amount = parseFloat(message.l);
    return {
      info: message,
      timestamp: message.T,
      datetime: moment(message.T).toISOString(),
      symbol: this._publicCcxtInstance.markets_by_id[message.s]
        ? this._publicCcxtInstance.markets_by_id[message.s].symbol
        : message.s,
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
        currency: this._publicCcxtInstance.safeCurrencyCode(message.N),
      },
    };
  };

  private getSpotOrderEventType = (message: BinanceSpotOrderMessage) => {
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

    if (newStatus === 'FILLED' && originalOrder.status !== 'closed') {
      return OrderEventType.ORDER_CLOSED;
    } else if (newStatus === 'CANCELED' && originalOrder.status !== 'canceled') {
      return OrderEventType.ORDER_CANCELED;
    } else if (newStatus === 'REJECTED' && originalOrder.status !== 'failed') {
      return OrderEventType.ORDER_FAILED;
    }

    return OrderEventType.ORDER_UPDATED;
  };

  private parseSpotBalance = (
    message: BinanceSpotAccountInfoMessage | BinanceSpotAccountPositionMessage
  ): BalanceUpdate | undefined => {
    const update: BalanceUpdate = { info: message as any };

    if (!message.B) {
      return undefined;
    }

    for (const updateMessage of message.B) {
      const free = parseFloat(updateMessage.f);
      const used = parseFloat(updateMessage.l);
      const code = this._ccxtInstance['safeCurrencyCode'](updateMessage.a);
      update[code] = {
        free,
        used,
        total: free + used,
      };
    }

    return this._ccxtInstance['parseBalance'](update);
  };

  private getFutureOrderId = (message: BinanceFutureOrderMessage) => {
    const id = message.o.i.toString();

    if (!id) {
      throw new Error('Invalid order message from binance.');
    }

    return id;
  };

  private getFutureOrderEventType = (message: BinanceFutureOrderMessage) => {
    const id = message.o && message.o.i ? message.o.i : undefined;

    if (!id) {
      throw new Error('Invalid order message from binance.');
    }

    const newStatus = message.o.X;
    const originalOrder = this.getCachedOrder(id);

    if (!newStatus) {
      return OrderEventType.ORDER_UPDATED;
    }

    if (!originalOrder) {
      return OrderEventType.ORDER_CREATED;
    }

    if (newStatus === 'FILLED' && originalOrder.status !== 'closed') {
      return OrderEventType.ORDER_CLOSED;
    } else if (newStatus === 'CANCELED' && originalOrder.status !== 'canceled') {
      return OrderEventType.ORDER_CANCELED;
    } else if (newStatus === 'REJECTED' && originalOrder.status !== 'failed') {
      return OrderEventType.ORDER_FAILED;
    }

    return OrderEventType.ORDER_UPDATED;
  };

  private parseFutureOrder = (message: BinanceFutureOrderMessage): ccxt.Order => {
    const statuses: Record<BinanceFutureOrderStatus, OrderStatus> = {
      NEW: 'open',
      PARTIALLY_FILLED: 'open',
      FILLED: 'closed',
      CANCELED: 'canceled',
      PENDING_CANCEL: 'open',
      REJECTED: 'failed',
      EXPIRED: 'canceled',
      REPLACED: 'open',
      STOPPED: 'canceled',
      NEW_INSURANCE: 'open', // Liquidation with Insurance Fund
      NEW_ADL: 'open', // Counterparty Liquidation
    };

    const rawOrder = message.o;

    const id = this.getFutureOrderId(message);
    const originalOrder = this.getCachedOrder(id);
    const average = parseFloat(rawOrder.ap);
    const amount = parseFloat(rawOrder.q);

    const originalPrice = parseFloat(rawOrder.p);
    const lastFilledPrice = parseFloat(rawOrder.L);
    const filled = parseFloat(rawOrder.l);
    const cost = lastFilledPrice * amount;

    const order: Order = {
      info: message,
      symbol: this._publicCcxtInstance.markets_by_id[rawOrder.s]
        ? this._publicCcxtInstance.markets_by_id[rawOrder.s].symbol
        : rawOrder.s,
      status: statuses[rawOrder.X],
      price: cost && filled ? cost / filled : originalPrice,
      average,
      amount,
      remaining: amount - filled,
      cost,
      datetime: moment(message.T).toISOString(),
      timestamp: message.T,
      filled,
      side: rawOrder.S === 'BUY' ? 'buy' : 'sell',
      trades: [],
      type: this.getOrderType(rawOrder.o),
      clientId: rawOrder.c ? rawOrder.c : undefined,
      id,
    };

    const mergedOrder = R.mergeDeepWith(
      (left, right) => (right === undefined ? left : right),
      originalOrder,
      order
    );

    return mergedOrder;
  };

  private parseFutureTrade = (message: BinanceFutureOrderMessage): Trade => {
    const rawTrade = message.o;
    const price = parseFloat(rawTrade.L);
    const amount = parseFloat(rawTrade.l);
    return {
      info: message,
      timestamp: message.T,
      datetime: moment(message.T).toISOString(),
      symbol: this._publicCcxtInstance.markets_by_id[rawTrade.s]
        ? this._publicCcxtInstance.markets_by_id[rawTrade.s].symbol
        : rawTrade.s,
      id: rawTrade.t.toString(),
      order: rawTrade.i.toString(),
      type: this.getOrderType(rawTrade.o),
      takerOrMaker: rawTrade.m ? 'maker' : 'taker',
      side: rawTrade.S === 'BUY' ? 'buy' : 'sell',
      price,
      amount,
      cost: price * amount,
      fee: {
        cost: rawTrade.n ? parseFloat(rawTrade.n) : 0,
        currency: this._publicCcxtInstance.safeCurrencyCode(rawTrade.N),
      },
    };
  };

  private parseFuturePositions = (message: BinanceFutureAccountInfoMessage): PositionUpdate => {
    const update: PositionUpdate = [];

    for (const rawPosition of message.a.P) {
      const amount = parseFloat(rawPosition.pa);
      const unrealizedPnL = parseFloat(rawPosition.up);
      const entryPrice = parseFloat(rawPosition.ep);
      const side = rawPosition.ps.toLowerCase();
      const symbol = this._publicCcxtInstance.markets_by_id[rawPosition.s]
        ? this._publicCcxtInstance.markets_by_id[rawPosition.s].symbol
        : rawPosition.s;

      let markPrice = 0;
      if (amount !== 0) {
        markPrice = amount > 0 ? unrealizedPnL / amount + entryPrice : unrealizedPnL / amount - entryPrice;
      }

      update.push({
        info: rawPosition,
        symbol,
        amount,
        entryPrice,
        markPrice,
        side,
      });
    }

    return update;
  };
}
