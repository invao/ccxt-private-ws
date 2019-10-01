import ReconnectingWebsocket from 'reconnecting-websocket';
import ccxt from 'ccxt';
import { ExchangeName } from '.';
export declare type Trade = {
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
export declare type OrderExecutionType = 'limit' | 'market' | 'unknown';
export declare type Order = {
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
export declare enum OrderEventType {
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_UPDATED = "ORDER_UPDATED",
    ORDER_CLOSED = "ORDER_CLOSED"
}
export declare type OrderEvent = {
    type: OrderEventType;
    order: Order;
};
export declare type OrderInput = {
    symbol: string;
    type: 'limit';
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    clientId?: string;
};
export declare type SubscribeCallback = (event: OrderEvent) => void;
export declare type ExchangeConstructorParameters = {
    name: ExchangeName;
    url: string;
    credentials: ExchangeCredentials;
};
export declare type ExchangeConstructorOptionalParameters = {
    debug?: boolean;
};
export declare type ExchangeCredentials = {
    apiKey?: string;
    secret?: string;
    uid?: string;
    password?: string;
};
export declare abstract class Exchange {
    private readonly _name;
    protected _ws: ReconnectingWebsocket;
    private _connected?;
    protected _credentials: ExchangeCredentials;
    protected _random: Function;
    protected _debug: boolean;
    protected _ccxtInstance: ccxt.Exchange;
    private _orderCallback?;
    private _resolveConnect?;
    constructor(params: ExchangeConstructorParameters & ExchangeConstructorOptionalParameters);
    subscribeOrders?({ callback }: {
        callback: SubscribeCallback;
    }): void;
    createOrder?({ order }: {
        order: OrderInput;
    }): void;
    cancelOrder?({ id }: {
        id: string;
    }): void;
    createClientId?(): string;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    getName: () => ExchangeName;
    protected abstract onMessage(event: MessageEvent): void;
    protected onOpen?(): void;
    protected onClose?(): void;
    private _onMessage;
    private _onOpen;
    private _onClose;
    private _onError;
    protected assertConnected: () => Promise<void>;
    protected setOrderCallback: (callback: SubscribeCallback) => void;
    protected onOrder: (event: OrderEvent) => void;
    debug: (message: string) => void;
}
