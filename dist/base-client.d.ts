/// <reference types="node" />
import AsyncLock from 'async-lock';
import ccxt from 'ccxt';
import domain from 'domain';
import { EventEmitter } from 'events';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { ExchangeName } from './';
import { Exchange, ExchangeConstructorOptionalParameters, ExchangeConstructorParameters, ExchangeCredentials, Order, OrderEvent, OrderInput, Trade, WalletType } from './exchange';
export declare abstract class BaseClient extends EventEmitter implements Exchange {
    createOrder?({ order }: {
        order: OrderInput;
    }): Promise<void>;
    cancelOrder?({ id }: {
        id: string;
    }): Promise<void>;
    createClientId?(): string;
    protected abstract onMessage(event: MessageEvent): void;
    protected onOpen?(): void;
    protected onClose?(): void;
    protected _ws?: ReconnectingWebSocket;
    protected _credentials: ExchangeCredentials;
    protected _random: Function;
    protected _debug: boolean;
    protected _ccxtInstance: ccxt.Exchange;
    protected _subscribeFilter: string[];
    protected subscriptionKeyMapping: Record<string, string | string[]>;
    protected lock: AsyncLock;
    protected lockDomain: domain.Domain;
    protected preConnect?: () => void;
    protected _walletType?: WalletType;
    protected _accountId?: string;
    private readonly _name;
    private _url?;
    private _connected?;
    private _?;
    private _resolveConnect?;
    private _orders;
    private _reconnectIntervalEnabled;
    private _reconnectIntervalMs;
    private _reconnectInterval?;
    constructor(params: ExchangeConstructorParameters & ExchangeConstructorOptionalParameters);
    connect: () => Promise<void>;
    setReconnectInterval: (setup?: {
        enabled?: boolean | undefined;
        intervalMs?: number | undefined;
    } | undefined) => void;
    reconnect: (code?: number | undefined, reason?: string | undefined) => Promise<void>;
    disconnect: () => Promise<void>;
    getName: () => ExchangeName;
    subscribeOrders: () => void;
    subscribeBalances: () => void;
    subscribePositions: () => void;
    protected send: (message: string) => void;
    protected getCredentials: () => import("./exchange").StaticExchangeCredentials;
    protected assertConnected: () => Promise<void>;
    protected onOrder: (event: OrderEvent) => void;
    protected debug: (message: string) => void;
    protected getCachedOrder: (id: string | number) => Order;
    protected saveCachedOrder: (order: Order) => Promise<void>;
    protected saveCachedTrade: ({ trade, orderId }: {
        trade: Trade;
        orderId: string;
    }) => Promise<Order>;
    protected setUrl: (url: string) => void;
    protected updateFeeFromTrades: ({ orderId }: {
        orderId: string | number;
    }) => Promise<void>;
    private _onMessage;
    private _onOpen;
    private _onClose;
    private _onError;
}
