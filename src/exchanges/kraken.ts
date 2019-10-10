import {
  ExchangeCredentials,
  OrderInput,
  Order,
  OrderEventType
} from '../exchange';
import ccxt from 'ccxt';
import * as R from 'ramda';
import { BaseClient } from '../base-client';

type KrakenMessage = KrakenOpenOrdersMessage;
type KrakenOpenOrdersMessage = [KrakenOrderMessageContent[], 'openOrders'];
type KrakenOrderMessageContent = {
  [orderid: string]: {
    refid?: string;
    userref?: string;
    status?: 'open' | 'closed' | string;
    opentm?: number;
    starttm?: number;
    expiretm?: number;
    descr?: {
      pair?: string;
      type?: 'buy' | 'sell' | string;
      ordertype?: 'limit' | string;
      price?: number;
      price2?: number;
      leverage?: number;
      order?: string;
      close?: string;
    };
    vol?: number;
    vol_exec?: number;
    cost?: number;
    fee?: number;
    price?: number;
    stopprice?: number;
    limitprice?: number;
    misc?: string;
    oflags?: string;
  };
};

type KrakenConstructorParams = {
  credentials: ExchangeCredentials;
};

const isKrakenOpenOrdersMessage = (message: KrakenMessage): message is KrakenOpenOrdersMessage => {
  return (message as KrakenOpenOrdersMessage)[1] === 'openOrders';
};

export class kraken extends BaseClient {
  private _publicCcxtInstance: ccxt.Exchange;
  constructor(params: KrakenConstructorParams) {
    super({ ...params, url: 'wss://beta-ws.kraken.com/', name: 'kraken' });
    this.subscriptionKeyMapping = {
      orders: 'openOrders'
    };
    this._publicCcxtInstance = new ccxt['kraken']();
  }

  protected onMessage = async (event: MessageEvent) => {
    const data: KrakenMessage = JSON.parse(event.data);

    if (isKrakenOpenOrdersMessage(data)) {
      for (const message of data[0]) {
        const id = this.getOrderId(message);
        await this.lock.acquire(id, async () => {
          const type = this.getOrderEventType(message);
          const order = await this.parseOrder(message);
          await this.saveCachedOrder(order);
          this.onOrder({ type, order: this.getCachedOrder(order.id) });
        });
      }
    }
  };

  private _doAuth = async () => {
    const getWebsocketsTokenUrl = 'GetWebSocketsToken';
    await this._publicCcxtInstance.loadMarkets();
    const ccxtInstance = new ccxt['kraken']({ ...this.getCredentials() });
    const data = await ccxtInstance.fetch2(
      getWebsocketsTokenUrl,
      'private',
      'POST',
      undefined,
      undefined,
      undefined
    );

    const token = data.result.token;
    for (const filter of this._subscribeFilter) {
      this.send(JSON.stringify({ event: 'subscribe', subscription: { name: filter, token } }));
    }
  };

  protected onOpen = async () => {
    await this._doAuth();
  };

  public createOrder = async ({ order }: { order: OrderInput }) => {
    const ccxtInstance = new ccxt['kraken']({ ...this.getCredentials() });

    const options: any = {};
    if (order.clientId) {
      options['userref'] = parseInt(order.clientId);
    }
    const result: Order = await ccxtInstance.createOrder(
      order.symbol,
      'limit',
      order.side,
      order.amount,
      order.price,
      options
    );
    await this.saveCachedOrder(result);
  };

  private getOrderId = (message: KrakenOrderMessageContent) => {
    const id = Object.keys(message)[0];

    if (!id) {
      throw new Error('Invalid order message from kraken.');
    }

    return id;
  };

  private parseOrder = async (message: KrakenOrderMessageContent) => {
    const id = this.getOrderId(message);
    const originalOrder = this.getCachedOrder(id);
    const krakenOrder = message[id];
    let symbol;
    if (originalOrder) {
      symbol = originalOrder.symbol;
    } else if (krakenOrder.descr) {
      symbol = krakenOrder.descr.pair;
    }

    if (krakenOrder.descr) {
      krakenOrder.descr.pair = undefined; // ccxt generates DAI//USD instead of DAI/USD as symbol
    }

    const order: Order = {
      ...this._publicCcxtInstance.parseOrder(
        { ...(originalOrder ? originalOrder.info : {}), ...krakenOrder },
        symbol ? this._publicCcxtInstance.findMarket(symbol) : undefined
      ),
      clientId: krakenOrder.userref ? krakenOrder.userref.toString() : undefined,
      id
    };

    const mergedOrder = R.mergeDeepWith(
      (left, right) => (right === undefined ? left : right),
      originalOrder,
      order
    );

    return mergedOrder;
  };

  private getOrderEventType = (message: KrakenOrderMessageContent) => {
    const id = Object.keys(message)[0];

    if (!id) {
      throw new Error('Invalid order message from kraken.');
    }

    const krakenOrder = message[id];
    const newStatus = krakenOrder.status;
    const originalOrder = this.getCachedOrder(id);
    const originalStatus = originalOrder ? originalOrder.status : undefined;

    if (!newStatus) {
      return OrderEventType.ORDER_UPDATED;
    }

    if (!originalOrder) {
      return OrderEventType.ORDER_CREATED;
    }

    if (newStatus !== originalStatus) {
      switch (newStatus) {
        case 'pending':
        case 'open':
          return OrderEventType.ORDER_UPDATED;
        case 'close':
          return OrderEventType.ORDER_CLOSED;
        case 'canceled':
          return OrderEventType.ORDER_CANCELED;
        case 'expired':
          return OrderEventType.ORDER_CANCELED;
      }
    }

    return OrderEventType.ORDER_UPDATED;
  };

  public cancelOrder = async ({ id }: { id: string }) => {
    const ccxtInstance = new ccxt['kraken']({ ...this.getCredentials() });

    await ccxtInstance.cancelOrder(id);
  };

  public createClientId = () => {
    return this._random().toString();
  };
}
