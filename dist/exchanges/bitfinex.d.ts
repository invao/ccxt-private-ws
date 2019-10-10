import { OrderInput, ExchangeConstructorOptionalParameters } from '../exchange';
import { BaseClient } from '../base-client';
declare type BitfinexConstructorParams = {
    credentials: {
        apiKey: string;
        secret: string;
    };
};
export declare class bitfinex extends BaseClient {
    private _orderTypeMap;
    constructor(params: BitfinexConstructorParams & ExchangeConstructorOptionalParameters);
    protected onMessage: (event: MessageEvent) => Promise<void>;
    private _doAuth;
    createClientId: () => any;
    protected onOpen: () => void;
    createOrder: ({ order }: {
        order: OrderInput;
    }) => Promise<void>;
    cancelOrder: ({ id }: {
        id: string;
    }) => Promise<void>;
    private getOrderType;
    private parseOrder;
    private parseTrade;
    private parseOrderEventType;
    private parseOrderStatus;
    private parseBalance;
}
export {};
