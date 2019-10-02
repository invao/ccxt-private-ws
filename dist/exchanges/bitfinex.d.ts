import { Exchange, SubscribeCallback, OrderInput, ExchangeConstructorOptionalParameters } from '../exchange';
declare type BitfinexConstructorParams = {
    credentials: {
        apiKey: string;
        secret: string;
    };
};
export declare class bitfinex extends Exchange {
    private _orders;
    private _lock;
    private _subscribeFilter;
    private _orderTypeMap;
    constructor(params: BitfinexConstructorParams & ExchangeConstructorOptionalParameters);
    private updateFee;
    private saveOrder;
    private saveTrade;
    protected onMessage: (event: MessageEvent) => Promise<void>;
    subscribeOrders: ({ callback }: {
        callback: SubscribeCallback;
    }) => void;
    private _doAuth;
    createClientId: () => any;
    protected onOpen: () => void;
    createOrder: ({ order }: {
        order: OrderInput;
    }) => void;
    cancelOrder: ({ id }: {
        id: string;
    }) => void;
    private parseOrder;
    private parseTrade;
    private parseOrderEventType;
    private parseOrderStatus;
}
export {};
