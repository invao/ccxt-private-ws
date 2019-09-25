import { Exchange, SubscribeCallback, OrderInput } from '../exchange';
declare type BitfinexConstructorParams = {
    credentials: {
        apiKey: string;
        secret: string;
    };
};
export declare class bitfinex extends Exchange {
    private _orders;
    private _lock;
    private _orderTypeMap;
    constructor(params: BitfinexConstructorParams);
    private updateFee;
    private saveOrder;
    private saveTrade;
    protected onMessage: (event: MessageEvent) => Promise<void>;
    subscribeOrders: ({ callback }: {
        callback: SubscribeCallback;
    }) => void;
    createClientId: () => any;
    createOrder: ({ order }: {
        order: OrderInput;
    }) => {
        clientId: any;
    };
    private parseOrder;
    private parseTrade;
    private parseOrderEventType;
    private parseOrderStatus;
}
export {};
