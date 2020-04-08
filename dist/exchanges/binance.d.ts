import { BaseClient } from '../base-client';
import { ExchangeCredentials, OrderInput } from '../exchange';
declare type BinanceConstructorParams = {
    credentials: ExchangeCredentials;
};
export declare class binance extends BaseClient {
    private _publicCcxtInstance;
    private _keepAliveInterval?;
    private _listenKey?;
    constructor(params: BinanceConstructorParams);
    protected onMessage: (event: MessageEvent) => Promise<void>;
    private _keepAlive;
    private _doAuth;
    protected preConnect: () => Promise<void>;
    protected onOpen: () => Promise<void>;
    createOrder: ({ order }: {
        order: OrderInput;
    }) => Promise<void>;
    private getOrderId;
    private getOrderType;
    private parseOrder;
    private parseTrade;
    private getOrderEventType;
    cancelOrder: ({ id }: {
        id: string;
    }) => Promise<void>;
    createClientId: () => any;
    private parseBalance;
}
export {};
