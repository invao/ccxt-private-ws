import { Exchange, OrderInput, ExchangeConstructorOptionalParameters } from '../exchange';
declare type BitfinexConstructorParams = {
    credentials: {
        apiKey: string;
        secret: string;
    };
};
export declare class bitfinex extends Exchange {
    private _orderTypeMap;
    constructor(params: BitfinexConstructorParams & ExchangeConstructorOptionalParameters);
    private updateFee;
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
    private parseOrder;
    private parseTrade;
    private parseOrderEventType;
    private parseOrderStatus;
}
export {};
