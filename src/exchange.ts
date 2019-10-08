import WebSocket from 'ws';
import ReconnectingWebsocket, { Message } from 'reconnecting-websocket';
import uniqueRandom from 'unique-random';
import ccxt from 'ccxt';
import { ExchangeName } from '.';
import * as R from 'ramda';
import AsyncLock from 'async-lock';
import domain from 'domain';

export type Trade = {
  id: string;
  timestamp: number;
  amount: number;
  price: number;
  maker: boolean;
  fee?: {
    cost: number;
    currency: string;
  };
};

export type OrderExecutionType = 'limit' | 'market' | 'unknown';

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
  status: 'open' | 'closed' | 'canceled' | 'failed' | 'unknown';
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
  ORDER_CANCELED = 'ORDER_CANCELED'
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
  protected _ws: ReconnectingWebsocket;
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
    this._ws = new ReconnectingWebsocket(params.url, [], { WebSocket, startClosed: true });
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


  protected _send = (message: string) => {
    console.log(`Sending message to ${this.getName()}: ${message}`);
    this._ws.send(message);
  };

  protected getCredentials = () => {
    if (typeof this._credentials === 'function') {
      return this._credentials();
    } else {
      return this._credentials;
    }
  };

  public connect = async () => {
    await this._ccxtInstance.loadMarkets();

    this._connected = new Promise((resolve, reject) => {
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

    console.log(`Connection to ${this._name} established.`);
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
    this._ws.reconnect();
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
          type: 'unknown'
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
}
