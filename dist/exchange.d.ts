/// <reference types="node" />
import ReconnectingWebsocket from 'reconnecting-websocket';
import ccxt from 'ccxt';
import { ExchangeName } from '.';
import AsyncLock from 'async-lock';
import domain from 'domain';
export declare type Trade = {
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
        rate?: number;
    };
};
export declare type OrderExecutionType = 'limit' | 'market' | undefined;
export declare type OrderStatus = 'open' | 'closed' | 'canceled' | 'failed' | 'unknown';
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
    status: OrderStatus;
    fee?: {
        cost: number;
        currency: string;
    };
    trades?: Trade[];
    clientId?: string;
    info?: any;
};
export declare enum OrderEventType {
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_UPDATED = "ORDER_UPDATED",
    ORDER_CLOSED = "ORDER_CLOSED",
    ORDER_CANCELED = "ORDER_CANCELED",
    ORDER_FAILED = "ORDER_FAILED"
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
export declare type StaticExchangeCredentials = {
    apiKey?: string;
    secret?: string;
    uid?: string;
    password?: string;
};
export declare type ExchangeCredentials = StaticExchangeCredentials | (() => StaticExchangeCredentials);
export declare abstract class Exchange {
    private readonly _name;
    private _url?;
    protected _ws?: ReconnectingWebsocket;
    private _connected?;
    protected _credentials: ExchangeCredentials;
    protected _random: Function;
    protected _debug: boolean;
    protected _ccxtInstance: ccxt.Exchange;
    private _orderCallback?;
    private _resolveConnect?;
    protected _subscribeFilter: string[];
    protected subscriptionKeyMapping: Record<string, string>;
    private _orders;
    protected lock: AsyncLock;
    protected lockDomain: domain.Domain;
    constructor(params: ExchangeConstructorParameters & ExchangeConstructorOptionalParameters);
    createOrder?({ order }: {
        order: OrderInput;
    }): Promise<void>;
    cancelOrder?({ id }: {
        id: string;
    }): Promise<void>;
    createClientId?(): string;
    onConnect?(): Promise<void>;
    protected send: (message: string) => void;
    protected getCredentials: () => StaticExchangeCredentials;
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
    subscribeOrders: ({ callback }: {
        callback: SubscribeCallback;
    }) => void;
    protected onOrder: (event: OrderEvent) => void;
    debug: (message: string) => void;
    protected getCachedOrder: (id: string) => Order;
    protected saveCachedOrder: (order: Order) => Promise<void>;
    protected saveCachedTrade: ({ trade, orderId }: {
        trade: Trade;
        orderId: string;
    }) => Promise<Order>;
    protected setUrl: (url: string) => void;
    protected updateFeeFromTrades: ({ orderId }: {
        orderId: string;
    }) => Promise<void>;
}
