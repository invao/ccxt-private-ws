import crypto from 'crypto-js';

import { BaseClient } from '../base-client';
import { ExchangeConstructorOptionalParameters, Order, OrderEventType } from '../exchange';

type FtxConstructorParams = {
  credentials: {
    apiKey: string;
    secret: string;
  };
};

export class ftx extends BaseClient {
  constructor(params: FtxConstructorParams & ExchangeConstructorOptionalParameters) {
    super({ ...params, url: 'wss://ftx.com/ws/', name: 'ftx' });
    this.subscriptionKeyMapping = {
      orders: 'orders',
      fills: 'fills'
    };
  }

  public createClientId = () => {
    return this._random().toString();
  };

  protected onOpen = () => {
    this._doAuth();
  };

  private _doAuth = () => {
    const credentials = this.getCredentials();
    this.assertConnected();
    const time = Date.now();
    const sign = crypto.HmacSHA256(`${time}websocket_login`, credentials.secret).toString(crypto.enc.Hex);

    const payload = {
      op: 'login',
      args: {
        key: credentials.apiKey,
        sign,
        time
      }
    };

    this.send(JSON.stringify(payload));

    this.subscribe();
  };

  protected onMessage = async (event: MessageEvent) => {
    const { channel, type, data } = JSON.parse(event.data);

    if (type === 'update' && data && (channel === 'orders' || channel === 'fills')) {
      const order = this.parseOrder(data);
      const type = this.parseOrderEventType(data);
      this.saveCachedOrder(order);
      this.updateFeeFromTrades({ orderId: order.id });
      this.onOrder({ type, order: this.getCachedOrder(order.id) });
    }
  };

  private parseOrderEventType = (order: Order) => {
    const originalOrder = this.getCachedOrder(order.id);

    if (!originalOrder) {
      return OrderEventType.ORDER_CREATED;
    }

    if (order.status === 'closed' && originalOrder.status !== 'closed') {
      return OrderEventType.ORDER_CLOSED;
    } else if (order.status === 'canceled' && originalOrder.status !== 'canceled') {
      return OrderEventType.ORDER_CANCELED;
    } else if (order.status === 'failed' && originalOrder.status !== 'failed') {
      return OrderEventType.ORDER_FAILED;
    }

    return OrderEventType.ORDER_UPDATED;
  };

  private subscribe = () => {
    this.send(JSON.stringify({ op: 'subscribe', channel: 'orders' }));
    this.send(JSON.stringify({ op: 'subscribe', channel: 'fills' }));
  };

  private parseOrder = (data: object): Order => {
    return this._ccxtInstance['parseOrder'](data);
  };
}
