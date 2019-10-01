import { Exchange, SubscribeCallback, OrderInput } from '../exchange';
import fetch from 'node-fetch';
import qs from 'qs';
import crypto from 'crypto';
import moment from 'moment';

type BinanceConstructorParams = {
  credentials: {
    apiKey: string;
    secret: string;
  };
};

export class binance extends Exchange {
  constructor(params: BinanceConstructorParams) {
    super({ ...params, url: 'wss://ws-auth.kraken.com', name: 'binance' });
  }

  protected onMessage = async (event: MessageEvent) => {};

  protected onOpen = async () => {
    if (!this._credentials.apiKey) {
      throw new Error('Missing api key.');
    }

    if (!this._credentials.secret) {
      throw new Error('Missing api key.');
    }

    const params = { nonce: moment().valueOf() };

    const uri = 'https://api.kraken.com/0/private/GetWebSocketsToken';
    const apiSign = this.getSignature({
      uri,
      request: params,
      secret: this._credentials.secret,
      nonce: params.nonce
    });
    const response = await fetch(uri, {
      headers: { 'API-Key': this._credentials.apiKey, 'API-Sign': apiSign }
    });
    console.log('RESPONSE', response.json());
  };

  private getSignature = ({
    uri,
    request,
    secret,
    nonce
  }: {
    uri: string;
    request: any;
    secret: string;
    nonce: number;
  }) => {
    const message = qs.stringify(request);
    const secret_buffer = new Buffer(secret, 'base64');
    const hash = crypto.createHash('sha256');
    const hmac = crypto.createHmac('sha512', secret_buffer);
    const hash_digest = hash.update(nonce + message).digest();
    const hmac_digest = hmac.update(uri + hash_digest).digest('base64');

    return hmac_digest;
  };
}
