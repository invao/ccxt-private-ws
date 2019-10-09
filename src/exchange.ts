import WebSocket from 'ws';
import ReconnectingWebsocket, { Message } from 'reconnecting-websocket';
import uniqueRandom from 'unique-random';
import ccxt from 'ccxt';
import { ExchangeName } from '.';
import * as R from 'ramda';
import AsyncLock from 'async-lock';
import domain from 'domain';

export type Trade = {
  info: any;
  id: string;
  timestamp: number;
  datetime: string;
  symbol: string;
  order?: string;
  type: OrderExecutionType;
  side: 'buy' | 'sell';
  takerOrMaker: 'taker' | 'maker';
  price: number;
  amount: number;
  cost: number;
  fee?: {
    cost: number;
    currency: string;
    rate?: number
  };
};

export type OrderExecutionType = 'limit' | 'market' | undefined;
export type OrderStatus = 'open' | 'closed' | 'canceled' | 'failed' | 'unknown';
export type Order = {
  id: string;
  timestamp: number;
  datetime: string;
  symbol: string;
  type: OrderExecutionType;
  side: 'sell' | 'buy';
  price: number;
  amount: number;
  cost: number;
  average: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  fee?: {
    cost: number;
    currency: string;
  };
  trades?: Trade[];
  clientId?: string;
  info?: any;
};

export enum OrderEventType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_CLOSED = 'ORDER_CLOSED',
  ORDER_CANCELED = 'ORDER_CANCELED',
  ORDER_FAILED = 'ORDER_FAILED'
}

export type OrderEvent = {
  type: OrderEventType;
  order: Order;
};

export type OrderInput = {
  symbol: string;
  type: 'limit';
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  clientId?: string;
};

export type SubscribeCallback = (event: OrderEvent) => void;

export type ExchangeConstructorParameters = {
  name: ExchangeName;
  url: string;
  credentials: ExchangeCredentials;
};

export type ExchangeConstructorOptionalParameters = {
  debug?: boolean;
};

export type StaticExchangeCredentials = {
  apiKey?: string;
  secret?: string;
  uid?: string;
  password?: string;
};

export type ExchangeCredentials = StaticExchangeCredentials | (() => StaticExchangeCredentials);

export abstract class Exchange {
  private readonly _name: ExchangeName;
  private _url?: string;
  protected _ws?: ReconnectingWebsocket;
  private _connected?: Promise<boolean>;
  protected _credentials: ExchangeCredentials;
  protected _random: Function;
  protected _debug: boolean;
  protected _ccxtInstance: ccxt.Exchange;
  private _orderCallback?: SubscribeCallback;
  private _resolveConnect?: Function;
  protected _subscribeFilter: string[];
  protected subscriptionKeyMapping: Record<string, string>;
  private _orders: Record<string, Order>;
  protected lock: AsyncLock;
  protected lockDomain: domain.Domain;

  constructor(params: ExchangeConstructorParameters & ExchangeConstructorOptionalParameters) {
    this._name = params.name;
    this._url = params.url;
    this._credentials = params.credentials;
    this._random = uniqueRandom(0, Math.pow(2, 31));
    this._debug = params.debug ? true : false;
    this._ccxtInstance = new { ...ccxt }[this._name]();
    this._subscribeFilter = [];
    this.subscriptionKeyMapping = {};
    this._orders = {};
    this.lock = new AsyncLock({ domainReentrant: true });
    this.lockDomain = domain.create();
  }

  // Class interface to be implemented by specific exchanges
  public async createOrder?({ order }: { order: OrderInput }): Promise<void>;
  public async cancelOrder?({ id }: { id: string }): Promise<void>;
  public createClientId?(): string;
  public onConnect?(): Promise<void>;

  protected send = (message: string) => {
    console.log(`Sending message to ${this.getName()}: ${message}`);
    if (this._ws) {
      this._ws.send(message);
    } else {
      throw new Error('Websocket not connected.');
    }
  };

  protected getCredentials = () => {
    if (typeof this._credentials === 'function') {
      return this._credentials();
    } else {
      return this._credentials;
    }
  };

  public connect = async () => {
    if (this.onConnect) {
      await this.onConnect();
    }

    if (this._ws) {
      this._ws.close();
    }

    if (!this._url) {
      throw new Error('Websocket url missing.');
    }
    this._ws = new ReconnectingWebsocket(this._url, [], { WebSocket, startClosed: true });
    await this._ccxtInstance.loadMarkets();

    this._connected = new Promise((resolve, reject) => {
      if (!this._ws) {
        throw new Error('Websocket not connected.');
      }
      this._resolveConnect = resolve;
      this._ws.addEventListener('open', this._onOpen);
      this._ws.addEventListener('close', this._onClose);
      this._ws.addEventListener('error', this._onError);
      this._ws.reconnect();
    });
    this._ws.addEventListener('message', this._onMessage);

    await this.assertConnected();
  };

  public disconnect = async () => {
    this._connected = undefined;
    if (!this._ws) {
      throw new Error('Websocket not connected.');
    }
    this._ws.close();
    this._ws.removeEventListener('message', this._onMessage);
    this._ws.removeEventListener('open', this._onOpen);
    this._ws.removeEventListener('close', this._onClose);
    this._ws.removeEventListener('error', this._onError);
  };

  public getName = () => {
    return this._name;
  };

  protected abstract onMessage(event: MessageEvent): void;
  protected onOpen?(): void;
  protected onClose?(): void;

  private _onMessage = (event: MessageEvent) => {
    this.debug(`Event on ${this.getName()}: ${event.data}`);
    domain.create().run(() => {
      this.onMessage(event);
    });
  };

  private _onOpen = () => {
    if (this._resolveConnect) {
      this._resolveConnect(true);
    }

    console.log(`Connection to ${this._name} established at ${this._url}.`);
    if (this.onOpen) {
      this.onOpen();
    }
  };

  private _onClose = () => {
    if (this._resolveConnect) {
      this._resolveConnect(false);
    }
    console.log(`Connection to ${this._name} closed.`);
    if (this.onClose) {
      this.onClose();
    }
  };

  private _onError = () => {
    if (this._resolveConnect) {
      this._resolveConnect(false);
    }
  };

  protected assertConnected = async () => {
    if (!(await this._connected)) {
      throw new Error(`${this._name} not connected.`);
    }
  };

  protected setOrderCallback = (callback: SubscribeCallback) => {
    this._orderCallback = callback;
  };

  public subscribeOrders = ({ callback }: { callback: SubscribeCallback }) => {
    this._subscribeFilter = R.uniq([...this._subscribeFilter, this.subscriptionKeyMapping['orders']]);
    if (this._ws) {
      this._ws.reconnect();
    }
    this.setOrderCallback(callback);
  };

  protected onOrder = (event: OrderEvent) => {
    if (this._orderCallback) {
      this._orderCallback(event);
    }
  };

  public debug = (message: string) => {
    if (this._debug) {
      console.log(message);
    }
  };

  protected getCachedOrder = (id: string) => {
    return this._orders[id];
  };

  protected saveCachedOrder = async (order: Order) => {
    await this.lock.acquire(order.id, () => {
      if (!this._orders[order.id]) {
        this._orders[order.id] = order;
      } else {
        this._orders[order.id] = {
          ...order,
          trades: this._orders[order.id].trades
        };
      }
    });
  };

  protected saveCachedTrade = async ({ trade, orderId }: { trade: Trade; orderId: string }) => {
    return await this.lock.acquire(orderId, () => {
      if (!this._orders[orderId]) {
        this._orders[orderId] = {
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

      const order = this._orders[orderId];

      if (!order.trades) {
        order.trades = [trade];
      } else {
        const originalTradeIndex = R.findIndex(t => t.id === trade.id, order.trades);
        if (originalTradeIndex === -1) {
          order.trades.push(trade);
        } else {
          order.trades[originalTradeIndex] = trade;
        }
      }

      return order;
    });
  };

  protected setUrl = (url: string) => {
    this._url = url;
  }

  protected updateFeeFromTrades = async ({ orderId }: { orderId: string }) => {
    if (!this.getCachedOrder(orderId)) {
      throw new Error('Order does not exist.');
    }

    let fee = undefined;
    const order = this.getCachedOrder(orderId);
    const trades = order.trades;
    if (trades) {
      for (const trade of trades) {
        if (trade.fee) {
          if (!fee || !fee.currency) {
            fee = {
              currency: trade.fee.currency,
              cost: trade.fee.cost
            };
          } else {
            if (fee.currency !== trade.fee.currency) {
              throw new Error('Mixed currency fees not supported.');
            }
            fee.cost += trade.fee.cost;
          }
        }
      }
    }
    await this.saveCachedOrder({ ...order, fee });
  };
}
