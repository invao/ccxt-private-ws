import { Exchange, ExchangeCredentials, OrderInput } from '../exchange';
declare type KrakenConstructorParams = {
    credentials: ExchangeCredentials;
};
export declare class kraken extends Exchange {
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
}
export {};
