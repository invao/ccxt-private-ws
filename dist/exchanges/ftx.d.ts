import { BaseClient } from '../base-client';
import { ExchangeConstructorOptionalParameters } from '../exchange';
declare type FtxConstructorParams = {
    credentials: {
        apiKey: string;
        secret: string;
    };
};
export declare class ftx extends BaseClient {
    constructor(params: FtxConstructorParams & ExchangeConstructorOptionalParameters);
    createClientId: () => any;
    protected onOpen: () => void;
    private _doAuth;
    protected onMessage: (event: MessageEvent) => Promise<void>;
    private parseOrderEventType;
    private subscribe;
    private parseOrder;
}
export {};
