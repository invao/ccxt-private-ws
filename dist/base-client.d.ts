/// <reference types="node" />
import AsyncLock from 'async-lock';
import ccxt from 'ccxt';
import domain from 'domain';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { EventEmitter } from 'events';
import { Exchange, ExchangeConstructorOptionalParameters, ExchangeConstructorParameters, ExchangeCredentials, Order, OrderEvent, OrderInput, Trade, WalletType } from './exchange';
import { ExchangeName } from './';
export declare abstract class BaseClient extends EventEmitter implements Exchange {
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
    private readonly _name;
    private _url?;
    private _connected?;
    private _?;
    private _resolveConnect?;
    private _orders;
    constructor(params: ExchangeConstructorParameters & ExchangeConstructorOptionalParameters);
    createOrder?({ order }: {
        order: OrderInput;
    }): Promise<void>;
    cancelOrder?({ id }: {
        id: string;
    }): Promise<void>;
    createClientId?(): string;
    protected send: (message: string) => void;
    protected getCredentials: () => import("./exchange").StaticExchangeCredentials;
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
    subscribeOrders: () => void;
    subscribeBalances: () => void;
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
}
