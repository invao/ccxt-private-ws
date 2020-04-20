import { BaseClient } from '../base-client';
import { ExchangeConstructorOptionalParameters, OrderInput, WalletType } from '../exchange';
declare type BitfinexConstructorParams = {
    credentials: {
        walletType?: WalletType;
        apiKey: string;
        secret: string;
    };
};
export declare class bitfinex extends BaseClient {
    private _orderTypeMap;
    constructor(params: BitfinexConstructorParams & ExchangeConstructorOptionalParameters);
    createClientId: () => any;
    createOrder: ({ order }: {
        order: OrderInput;
    }) => Promise<void>;
    cancelOrder: ({ id }: {
        id: string;
    }) => Promise<void>;
    protected onMessage: (event: MessageEvent) => Promise<void>;
    protected onOpen: () => void;
    private _doAuth;
    private getOrderType;
    private parseOrder;
    private parseTrade;
    private parseOrderEventType;
    private parseOrderStatus;
    private parseBalance;
}
export {};
