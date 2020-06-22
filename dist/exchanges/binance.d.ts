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
    private onSpotMessages;
    private onFutureMessages;
    private _keepAlive;
    private _doAuth;
    protected preConnect: () => Promise<void>;
    protected onOpen: () => Promise<void>;
    createOrder: ({ order }: {
        order: OrderInput;
    }) => Promise<void>;
    cancelOrder: ({ id }: {
        id: string;
    }) => Promise<void>;
    createClientId: () => any;
    private getOrderType;
    private getSpotOrderId;
    private parseSpotOrder;
    private parseSpotTrade;
    private getSpotOrderEventType;
    private parseSpotBalance;
    private getFutureOrderId;
    private getFutureOrderEventType;
    private parseFutureOrder;
    private parseFutureTrade;
    private parseFuturePositions;
}
export {};
