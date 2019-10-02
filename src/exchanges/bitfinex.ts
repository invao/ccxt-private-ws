import {
  Exchange,
  SubscribeCallback,
  OrderEventType,
  Order,
  OrderExecutionType,
  Trade,
  OrderInput,
  ExchangeConstructorOptionalParameters
} from '../exchange';
import crypto from 'crypto-js';
import moment from 'moment';
import * as R from 'ramda';
import AsyncLock from 'async-lock';

type BitfinexConstructorParams = {
  credentials: {
    apiKey: string;
    secret: string;
  };
};

enum BitfinexOrderMessageCommands {
  NEW_ORDER = 'on',
  ORDER_CLOSED = 'oc',
  ORDER_UPDATED = 'ou'
}

enum BitfinexTradeMessageCommands {
  TRADE_EXECUTED = 'tu',
  TRADE_EXECUTED_UPDATED = 'te'
}

type BitfinexMessage = BitfinexOrderMessage | BitfinexTradeMessage;
type BitfinexOrderMessage = [0, BitfinexOrderMessageCommands, BitfinexOrderMessageContent];
type BitfinexTradeMessage = [0, BitfinexTradeMessageCommands, BitfinexTradeMessageContent];

type BitfinexOrderMessageContent = [
  string, //ID 0
  string | null, // GID 1
  string, // CID 2
  string, // SYMBOL 3
  number, // MTS_CREATE 4
  number, // MTS_UPDATE 5
  number, // AMOUNT 6
  number, // AMOUNT_ORIG 7


    | 'LIMIT'
    | 'MARKET'
    | 'STOP'
    | 'TRAILING STOP'
    | 'EXCHANGE MARKET'
    | 'EXCHANGE LIMIT'
    | 'EXCHANGE STOP'
    | 'EXCHANGE TRAILING STOP'
    | 'FOK'
    | 'EXCHANGE FOK'
    | 'IOC'
    | 'EXCHANGE IOC', // TYPE 8
  null, // TYPE_PREV 9
  null, // MTS_TIF 10
  null, // _PLACEHOLDER 11
  number, // FLAGS 12
  string, // STATUS 13
  null, // _PLACEHOLDER 14
  null, // _PLACEHOLDER 15
  number, // PRICE 16
  number, // PRICE_AVG 17
  number, // PRICE_TRAILING 18
  number, // PRICE_AUX_LIMIT 19
  null, // _PLACEHOLDER 20
  null, // _PLACEHOLDER 21
  null, // _PLACEHOLDER 22
  number, // NOTIFY 23
  number, // HIDDEN 24
  null, // PLACED_ID 25
  null, // _PLACEHOLDER 26
  null, // _PLACEHOLDER 27
  string, // ROUTING 28
  null, // _PLACEHOLDER 29
  null, // _PLACEHOLDER 30
  null // _PLACEHOLDER 31
];

type BitfinexTradeMessageContent = [
  string, // ID 0
  string, // SYMBOL 1
  number, // MTS_CREATE 2
  string, // ORDER_ID 3
  number, // EXEC_AMOUNT 4
  number, // EXEC_PRICE 5
  string, // ORDER_TYPE 6
  number, // ORDER_PRICE 7
  number, // MAKER 8
  number, // FEE 9
  string // FEE_CURRENCY
];

const isBitfinexOrderMessage = (message: BitfinexMessage): message is BitfinexOrderMessage => {
  return Object.values(BitfinexOrderMessageCommands).includes((message as BitfinexOrderMessage)[1]);
};

const isBitfinexTradeMessage = (message: BitfinexMessage): message is BitfinexTradeMessage => {
  return Object.values(BitfinexTradeMessageCommands).includes((message as BitfinexTradeMessage)[1]);
};

export class bitfinex extends Exchange {
  private _orders: Record<string, Order>;
  private _lock: AsyncLock;
  private _subscribeFilter: ('trading')[];
  private _orderTypeMap = {
    limit: 'EXCHANGE LIMIT'
  };

  constructor(params: BitfinexConstructorParams & ExchangeConstructorOptionalParameters) {
    super({ ...params, url: 'wss://api.bitfinex.com/ws/2', name: 'bitfinex' });
    this._orders = {};
    this._lock = new AsyncLock();
    this._subscribeFilter = [];
  }

  private updateFee = ({ orderId }: { orderId: string }) => {
    if (!this._orders[orderId]) {
      throw new Error('Order does not exist.');
    }

    let fee = undefined;
    const trades = this._orders[orderId].trades;
    if (trades) {
      for (const trade of trades) {
        if (trade.fee) {
          if (!fee || !fee.currency) {
            fee = {
              currency: trade.fee.currency,
              cost: trade.fee.cost
            };
          } else {
            if (fee.currency !== trade.fee.currency) {
              throw new Error('Mixed currency fees not supported.');
            }
            fee.cost += trade.fee.cost;
          }
        }
      }
    }
    this._orders[orderId].fee = fee;
  };

  private saveOrder = async ({ order }: { order: Order }) => {
    await this._lock.acquire(order.id, () => {
      if (!this._orders[order.id]) {
        this._orders[order.id] = order;
      } else {
        this._orders[order.id] = {
          ...order,
          trades: this._orders[order.id].trades
        };

        this.updateFee({ orderId: order.id });
      }
    });
  };

  private saveTrade = async ({ trade, orderId }: { trade: Trade; orderId: string }) => {
    return await this._lock.acquire(orderId, () => {
      if (!this._orders[orderId]) {
        this._orders[orderId] = {
          id: orderId,
          amount: 0,
          average: 0,
          cost: 0,
          datetime: '',
          filled: 0,
          price: 0,
          remaining: 0,
          side: 'buy',
          status: 'unknown',
          symbol: '',
          timestamp: 0,
          type: 'unknown'
        };
      }

      const order = this._orders[orderId];

      if (!order.trades) {
        order.trades = [trade];
      } else {
        const originalTradeIndex = R.findIndex(t => t.id === trade.id, order.trades);
        if (originalTradeIndex === -1) {
          order.trades.push(trade);
        } else {
          order.trades[originalTradeIndex] = trade;
        }
      }

      this.updateFee({ orderId: order.id });

      return order;
    });
  };

  protected onMessage = async (event: MessageEvent) => {
    const data: BitfinexMessage = JSON.parse(event.data);

    if (isBitfinexOrderMessage(data)) {
      const order = this.parseOrder(data[2]);
      const type = this.parseOrderEventType(data[1]);
      this.saveOrder({ order });
      this.onOrder({ type, order });
    } else if (isBitfinexTradeMessage(data)) {
      const trade = this.parseTrade(data[2]);
      const order = await this.saveTrade({ trade, orderId: data[2][3] });
      this.onOrder({ type: OrderEventType.ORDER_UPDATED, order });
    }
  };

  public subscribeOrders = ({ callback }: { callback: SubscribeCallback }) => {
    this._subscribeFilter = R.uniq([...this._subscribeFilter, 'trading'])
    this._doAuth();
    this.setOrderCallback(callback);
  };

  private _doAuth = () => {
    this.assertConnected();
    const authNonce = Date.now() * 1000;
    const authPayload = 'AUTH' + authNonce;
    const authSig = crypto.HmacSHA384(authPayload, this._credentials.secret).toString(crypto.enc.Hex);

    const payload = {
      apiKey: this._credentials.apiKey,
      authSig,
      authNonce,
      authPayload,
      event: 'auth',
      filter: this._subscribeFilter
    };

    this._send(JSON.stringify(payload));
  }
  public createClientId = () => {
    return this._random().toString();
  };

  protected onOpen = () => {
    this._doAuth();
  }

  public createOrder = ({ order }: { order: OrderInput }) => {
    const clientId = order.clientId ? order.clientId : this.createClientId();
    const marketId = this._ccxtInstance.market(order.symbol).id
    const orderData = {
      gid: 1,
      cid: parseInt(clientId),
      type: this._orderTypeMap[order.type],
      symbol: `t${marketId}`,
      amount: order.side === 'buy' ? order.amount.toString() : (-1 * order.amount).toString(),
      price: order.price.toString(),
      flags: 0
    };
    const payload = [0, 'on', null, orderData];
    this._send(JSON.stringify(payload));
  };

  public cancelOrder = ({ id }: { id: string }) => {
    const orderData = {
      id
    };
    const payload = [0, 'oc', null, orderData];
    this._send(JSON.stringify(payload));
  };

  private parseOrder = (data: BitfinexOrderMessageContent) => {
    let type: OrderExecutionType = 'unknown';

    switch (data[8]) {
      case 'EXCHANGE MARKET':
      case 'MARKET':
        type = 'market';
        break;
      case 'EXCHANGE LIMIT':
      case 'LIMIT':
        type = 'limit';
        break;
    }

    const status = this.parseOrderStatus(data[13]);
    let market = this._ccxtInstance.findMarket(data[3].substr(1, 6))
    if (!market) {
      market = { symbol: data[3].substr(1, 3) + '/' + data[3].substr(4, 3) }
    }

    const order: Order = {
      id: data[0],
      clientId: data[2] ? data[2].toString() : undefined,
      symbol: market.symbol,
      timestamp: data[4],
      datetime: moment(data[4]).toISOString(),
      amount: Math.abs(data[7]),
      filled: Math.abs(data[7]) - Math.abs(data[6]),
      type,
      average: data[17],
      cost: Math.abs(data[17] * data[7]),
      price: data[17],
      remaining: Math.abs(data[6]),
      side: data[7] > 0 ? 'buy' : 'sell',
      status
    };

    return order;
  };

  private parseTrade = (data: BitfinexTradeMessageContent) => {
    const trade: Trade = {
      id: data[0],
      timestamp: data[2],
      amount: Math.abs(data[4]),
      price: data[5],
      maker: data[8] === 1,
      fee: {
        cost: Math.abs(data[9]),
        currency: data[10]
      }
    };

    return trade;
  };

  private parseOrderEventType = (data: 'oc' | 'ou' | 'on' | string) => {
    switch (data) {
      case 'on':
        return OrderEventType.ORDER_CREATED;
      case 'ou':
        return OrderEventType.ORDER_UPDATED;
      case 'oc':
        return OrderEventType.ORDER_CLOSED;
      default:
        throw new Error(`Unknown bitfinex event type ${data}`);
    }
  };

  private parseOrderStatus = (data: string) => {
    if (data.includes('ACTIVE')) {
      return 'open';
    } else if (data.includes('CANCELED')) {
      return 'canceled';
    } else if (data.includes('EXECUTED')) {
      return 'closed';
    }

    return 'unknown';
  };
}
