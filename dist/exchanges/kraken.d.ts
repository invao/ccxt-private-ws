import { ExchangeCredentials, OrderInput } from '../exchange';
import { BaseClient } from '../base-client';
declare type KrakenConstructorParams = {
    credentials: ExchangeCredentials;
};
export declare class kraken extends BaseClient {
    private _publicCcxtInstance;
    constructor(params: KrakenConstructorParams);
    protected onMessage: (event: MessageEvent) => Promise<void>;
    private _doAuth;
    protected onOpen: () => Promise<void>;
    createOrder: ({ order }: {
        order: OrderInput;
    }) => Promise<void>;
    private getOrderId;
    private parseOrder;
    private getOrderEventType;
    cancelOrder: ({ id }: {
        id: string;
    }) => Promise<void>;
    createClientId: () => any;
}
export {};
