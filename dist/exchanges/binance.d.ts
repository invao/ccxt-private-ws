import { ExchangeCredentials, OrderInput } from '../exchange';
import { BaseClient } from '../base-client';
declare type BinanceConstructorParams = {
    credentials: ExchangeCredentials;
};
export declare class binance extends BaseClient {
    private _publicCcxtInstance;
    constructor(params: BinanceConstructorParams);
    protected onMessage: (event: MessageEvent) => Promise<void>;
    private _doAuth;
    onConnect: () => Promise<void>;
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
}
export {};
