import { Exchange } from '../exchange';
declare type BinanceConstructorParams = {
    credentials: {
        apiKey: string;
        secret: string;
    };
};
export declare class binance extends Exchange {
    constructor(params: BinanceConstructorParams);
    protected onMessage: (event: MessageEvent) => Promise<void>;
    protected onOpen: () => Promise<void>;
    private getSignature;
}
export {};
