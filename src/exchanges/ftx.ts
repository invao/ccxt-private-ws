import { Trade } from 'ccxt';
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
      fills: 'fills',
    };

    setInterval(this.ping, 15000);
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
        time,
        subaccount: this._accountId,
      },
    };

    this.send(JSON.stringify(payload));

    this.subscribe();
  };

  protected onMessage = async (event: MessageEvent) => {
    const { channel, type, data } = JSON.parse(event.data);

    if (type === 'update' && data) {
      switch (channel) {
        case 'orders': {
          const order = this.parseOrder(data);
          if (!this.isCorrectMarketType(order)) {
            return;
          }

          const type = this.parseOrderEventType(data);
          this.saveCachedOrder(order);
          this.updateFeeFromTrades({ orderId: order.id });
          this.onOrder({ type, order: this.getCachedOrder(order.id) });
          break;
        }
        case 'fills': {
          const trade = this.parseTrade(data);
          if (!this.isCorrectMarketType(trade) || !trade.order) {
            return;
          }

          const order = await this.saveCachedTrade({ trade, orderId: trade.order });
          this.updateFeeFromTrades({ orderId: order.id });
          this.onOrder({ type: OrderEventType.ORDER_UPDATED, order: this.getCachedOrder(order.id) });
          break;
        }
      }
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

  private ping = async () => {
    try {
      await this.assertConnected();
      this.send(JSON.stringify({ op: 'ping' }));
    } catch (e) {
      // Doing nothing for now
    }
  };

  private parseOrder = (data: object): Order => {
    return this._ccxtInstance['parseOrder'](data);
  };

  private parseTrade = (data: object): Trade => {
    return this._ccxtInstance['parseTrade'](data);
  };

  private isCorrectMarketType = (order: Order | Trade) => {
    const [base, quote] = order.symbol.split('/');

    switch (this._walletType) {
      case undefined:
      case null:
      case 'spot':
        return base && quote;
      case 'future':
        return base && !quote;
      default:
        return false;
    }
  };
}
