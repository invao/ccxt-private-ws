import WebSocket from 'ws';
import ReconnectingWebsocket, { Message } from 'reconnecting-websocket';
import uniqueRandom from 'unique-random';

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
};

export enum OrderEventType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_CLOSED = 'ORDER_CLOSED'
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
  name: string;
  url: string;
  credentials: ExchangeCredentials;
};

export type ExchangeCredentials = {
  apiKey?: string;
  secret?: string;
  uid?: string;
  password?: string;
};

export abstract class Exchange {
  private readonly _name: string;
  protected _ws: ReconnectingWebsocket;
  private _connected?: Promise<boolean>;
  protected _credentials: ExchangeCredentials;
  protected _random: Function;

  private _orderCallback?: SubscribeCallback;

  constructor(params: ExchangeConstructorParameters) {
    this._name = params.name;
    this._ws = new ReconnectingWebsocket(params.url, [], { WebSocket });
    this._credentials = params.credentials;
    this._random = uniqueRandom(0, Math.pow(2, 45));
  }

  public abstract subscribeOrders({ callback }: { callback: SubscribeCallback }): void;
  public abstract createOrder({ order }: { order: OrderInput }): { clientId?: string };
  public abstract createClientId(): string;

  public connect = async () => {
    this._connected = new Promise((resolve, reject) => {
      this._ws.addEventListener('open', () => {
        resolve(true);
        this._onOpen();
      });
      this._ws.addEventListener('error', () => {
        resolve(false);
      });
    });
    this._ws.addEventListener('message', this._onMessage);

    await this.assertConnected();
  };

  public getName = () => {
    return this._name;
  };

  protected abstract onMessage(event: MessageEvent): void;

  private _onOpen = () => {
    console.log(`Connection to ${this._name} established.`);
  };

  private _onMessage = (event: MessageEvent) => {
    this.onMessage(event);
  };

  protected assertConnected = async () => {
    if (!(await this._connected)) {
      throw new Error(`${this._name} not connected.`);
    }
  };

  protected setOrderCallback = (callback: SubscribeCallback) => {
    this._orderCallback = callback;
  };

  protected onOrder = (event: OrderEvent) => {
    if (this._orderCallback) {
      this._orderCallback(event);
    }
  };
}
