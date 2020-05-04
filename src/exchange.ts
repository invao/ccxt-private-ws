import ccxt from 'ccxt';

import { ExchangeName } from './';

export type Trade = {
  info: any;
  id: string;
  timestamp: number;
  datetime: string;
  symbol: string;
  order?: string;
  type?: OrderExecutionType;
  side: 'buy' | 'sell';
  takerOrMaker: 'taker' | 'maker';
  price: number;
  amount: number;
  cost: number;
  fee?: {
    cost: number;
    currency: string;
    rate?: number;
  };
};

export type OrderExecutionType =
  | 'limit'
  | 'market'
  | 'stoplossLimit'
  | 'stoplossMarket'
  | 'trailingStoploss'
  | string
  | undefined;

export type OrderStatus = 'open' | 'closed' | 'canceled' | 'failed' | 'unknown';
export type Order = {
  id: string | number;
  timestamp: number;
  datetime: string;
  symbol: string;
  type: OrderExecutionType;
  side: 'sell' | 'buy';
  price: number;
  amount: number;
  cost: number;
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

export type BalanceEvent = { update: BalanceUpdate };

export type OrderInput = {
  symbol: string;
  type: 'limit';
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  clientId?: string;
};

export type OrderListener = (event: OrderEvent) => void;
export type BalanceListener = (event: BalanceEvent) => void;
export type ConnectListener = () => void;

export type BalanceUpdate = ccxt.Balances;

export type WalletType = 'spot' | 'margin' | 'future';

export type ExchangeConstructorParameters = {
  name: ExchangeName;
  url: string;
  credentials: ExchangeCredentials;
};

export type ExchangeConstructorOptionalParameters = {
  debug?: boolean;
  reconnectIntervalEnabled?: boolean;
  reconnectIntervalMs?: number;
};

export type StaticExchangeCredentials = {
  walletType?: WalletType;
  apiKey?: string;
  secret?: string;
  uid?: string;
  password?: string;
};

export type ExchangeCredentials = StaticExchangeCredentials | (() => StaticExchangeCredentials);

export interface Exchange {
  on(event: 'order', listener: OrderListener): void;
  on(event: 'balance', listener: BalanceListener): void;
  on(event: 'fullBalance', listener: BalanceListener): void;
  on(event: 'connect', listener: ConnectListener): void;

  createOrder?({ order }: { order: OrderInput }): Promise<void>;
  cancelOrder?({ id }: { id: string }): Promise<void>;
  createClientId?(): string;

  subscribeOrders(): void;
  subscribeBalances(): void;

  connect(): Promise<void>;
  disconnect(): Promise<void>;

  getName(): string;
}
