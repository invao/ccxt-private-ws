import crypto from 'crypto-js';
import Decimal from 'decimal.js';
import moment from 'moment';

import { BaseClient } from '../base-client';
import {
  BalanceUpdate,
  ExchangeConstructorOptionalParameters,
  Order,
  OrderEventType,
  OrderExecutionType,
  OrderInput,
  PositionUpdate,
  Trade,
  WalletType,
} from '../exchange';

type BitfinexConstructorParams = {
  credentials: {
    walletType?: WalletType;
    apiKey: string;
    secret: string;
  };
};

enum BitfinexOrderMessageCommands {
  NEW_ORDER = 'on',
  ORDER_CLOSED = 'oc',
  ORDER_UPDATED = 'ou',
}

enum BitfinexTradeMessageCommands {
  TRADE_EXECUTED = 'tu',
  TRADE_EXECUTED_UPDATED = 'te',
}

enum BitfinexWalletMessageCommands {
  WALLET_STATUS = 'ws',
}

enum BitfinexWalletUpdateMessageCommands {
  WALLET_UPDATED = 'wu',
}

enum BitfinexPositionMessageCommands {
  POSITION_SNAPSHOT = 'ps',
}

enum BitfinexPositionUpdateMessageCommands {
  POSITION_NEW = 'pn',
  POSITION_UPDATE = 'pu',
  POSITION_CLOSE = 'pc',
}

type BitfinexMessage =
  | BitfinexOrderMessage
  | BitfinexTradeMessage
  | BitfinexWalletMessage
  | BitfinexWalletUpdateMessage
  | BitfinexPositionMessage
  | BitfinexPositionUpdateMessage;
type BitfinexOrderMessage = [0, BitfinexOrderMessageCommands, BitfinexOrderMessageContent];
type BitfinexTradeMessage = [0, BitfinexTradeMessageCommands, BitfinexTradeMessageContent];
type BitfinexWalletMessage = [0, BitfinexWalletMessageCommands, BitfinexWalletMessageContent];
type BitfinexWalletUpdateMessage = [
  0,
  BitfinexWalletUpdateMessageCommands,
  BitfinexWalletUpdateMessageContent
];
type BitfinexPositionMessage = [0, BitfinexPositionMessageCommands, BitfinexPositionMessageContent];
type BitfinexPositionUpdateMessage = [
  0,
  BitfinexPositionUpdateMessageCommands,
  BitfinexPositionMessageContent
];

type BitfinexPositionMessageContent = [
  string, // SYMBOL 0
  string, // STATUS 1
  number, // AMOUNT 2
  number, // BASE_PRICE 3
  number, // MARGIN_FUNDING 4
  number, // MARGIN_FUNDING_TYPE 5
  number, // PL 6
  number, // PL_PERC 7
  number, // PRICE_LIQ 8
  number, // LEVERAGE 9
  number, // FLAG 10
  number, // POSITION_ID 11
  number, // MTS_CREATE 12
  number, // MTS_UPDATE 13
  null, // PLACEHOLDER 14
  number, // TYPE 15
  null, // PLACEHOLDER 16
  number, // COLLATERAL 17
  number, // COLLATERAL_MIN 18
  any // META 19
];

type BitfinexOrderMessageContent = [
  string, //ID 0
  string | null, // GID 1
  string, // CID 2
  string, // SYMBOL 3
  number, // MTS_CREATE 4
  number, // MTS_UPDATE 5
  number, // AMOUNT 6
  number, // AMOUNT_ORIG 7
  (
    | 'LIMIT'
    | 'MARKET'
    | 'STOP'
    | 'TRAILING STOP'
    | 'EXCHANGE MARKET'
    | 'EXCHANGE LIMIT'
    | 'EXCHANGE STOP'
    | 'EXCHANGE STOP LIMIT'
    | 'EXCHANGE TRAILING STOP'
    | 'TRAILING STOP'
    | 'FOK'
    | 'EXCHANGE FOK'
    | 'IOC'
    | 'EXCHANGE IOC'
  ), // TYPE 8
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

type BitfinexWalletMessageContent = BitfinexWalletUpdateMessageContent[];

type BitfinexWalletUpdateMessageContent = [
  string, // WALLET_TYPE 0
  string, // CURRENCY 1
  number, // TOTAL 2
  number, // USED 3
  number | null // FREE 4
];

const isBitfinexOrderMessage = (message: BitfinexMessage): message is BitfinexOrderMessage => {
  return Object.values(BitfinexOrderMessageCommands).includes((message as BitfinexOrderMessage)[1]);
};

const isBitfinexTradeMessage = (message: BitfinexMessage): message is BitfinexTradeMessage => {
  return Object.values(BitfinexTradeMessageCommands).includes((message as BitfinexTradeMessage)[1]);
};

const isBitfinexWalletMessage = (message: BitfinexMessage): message is BitfinexWalletMessage => {
  return Object.values(BitfinexWalletMessageCommands).includes((message as BitfinexWalletMessage)[1]);
};

const isBitfinexWalletUpdateMessage = (message: BitfinexMessage): message is BitfinexWalletUpdateMessage => {
  return Object.values(BitfinexWalletUpdateMessageCommands).includes(
    (message as BitfinexWalletUpdateMessage)[1]
  );
};

const isBitfinexPositionMessage = (message: BitfinexMessage): message is BitfinexPositionMessage => {
  return Object.values(BitfinexPositionMessageCommands).includes((message as BitfinexPositionMessage)[1]);
};

const isBitfinexPositionUpdateMessage = (
  message: BitfinexMessage
): message is BitfinexPositionUpdateMessage => {
  return Object.values(BitfinexPositionUpdateMessageCommands).includes(
    (message as BitfinexPositionUpdateMessage)[1]
  );
};

export class bitfinex extends BaseClient {
  private _orderTypeMap = {
    limit: 'EXCHANGE LIMIT',
  };

  constructor(params: BitfinexConstructorParams & ExchangeConstructorOptionalParameters) {
    super({ ...params, url: 'wss://api.bitfinex.com/ws/2', name: 'bitfinex', exchangeType: 'bitfinex2' });
    this._walletType = this._walletType || 'spot';

    const balanceTypes = {
      spot: 'wallet',
      margin: 'wallet',
      future: 'wallet',
    };

    this.subscriptionKeyMapping = {
      orders: 'trading',
      balance: balanceTypes[this._walletType],
    };
  }

  public createClientId = () => {
    return this._random().toString();
  };

  public createOrder = async ({ order }: { order: OrderInput }) => {
    const clientId = order.clientId ? order.clientId : this.createClientId();
    const marketId = this._ccxtInstance.market(order.symbol).id;
    const orderData = {
      gid: 1,
      cid: parseInt(clientId),
      type: this._orderTypeMap[order.type],
      symbol: `t${marketId}`,
      amount: order.side === 'buy' ? order.amount.toString() : (-1 * order.amount).toString(),
      price: order.price.toString(),
      flags: 0,
    };
    const payload = [0, 'on', null, orderData];
    this.send(JSON.stringify(payload));
  };

  public cancelOrder = async ({ id }: { id: string }) => {
    const orderData = {
      id,
    };
    const payload = [0, 'oc', null, orderData];
    this.send(JSON.stringify(payload));
  };

  protected onMessage = async (event: MessageEvent) => {
    const data: BitfinexMessage = JSON.parse(event.data);

    if (isBitfinexOrderMessage(data)) {
      const order = this.parseOrder(data[2]);
      if (!this.isOrderMatchingWalletType(order)) {
        return;
      }

      const type = this.parseOrderEventType(data[1]);
      await this.saveCachedOrder(order);
      await this.updateFeeFromTrades({ orderId: order.id });
      this.onOrder({ type, order: this.getCachedOrder(order.id) });
    } else if (isBitfinexTradeMessage(data)) {
      const trade = this.parseTrade(data[2]);
      if (!this.isTradeMatchingWalletType(trade)) {
        return;
      }

      const order = await this.saveCachedTrade({ trade, orderId: data[2][3] });
      await this.updateFeeFromTrades({ orderId: order.id });
      this.onOrder({ type: OrderEventType.ORDER_UPDATED, order: this.getCachedOrder(order.id) });
    } else if (isBitfinexWalletMessage(data)) {
      for (const message of data[2]) {
        const balance = this.parseBalance(message);
        if (balance) {
          this.emit('balance', { update: balance });
        }
      }
    } else if (isBitfinexWalletUpdateMessage(data)) {
      const balance = this.parseBalance(data[2]);
      if (balance) {
        this.emit('balance', { update: balance });
      }
    } else if (isBitfinexPositionMessage(data) && this._walletType !== 'spot') {
      const positions = this.parsePositions(data[2]);

      if (positions.length) {
        this.emit('positions', { update: positions });
      }
    } else if (isBitfinexPositionUpdateMessage(data) && this._walletType !== 'spot') {
      const positions = this.parsePositions([data[2]]);

      if (positions.length) {
        this.emit('positions', { update: positions });
      }
    }
  };

  protected onOpen = () => {
    this._doAuth();
  };

  private _doAuth = () => {
    const credentials = this.getCredentials();
    this.assertConnected();
    const authNonce = Date.now() * 1000;
    const authPayload = 'AUTH' + authNonce;
    const authSig = crypto.HmacSHA384(authPayload, credentials.secret).toString(crypto.enc.Hex);

    const payload = {
      apiKey: credentials.apiKey,
      authSig,
      authNonce,
      authPayload,
      event: 'auth',
      filter: this._subscribeFilter,
    };

    this.send(JSON.stringify(payload));
  };

  private getOrderType = (type: string): OrderExecutionType => {
    switch (type) {
      case 'EXCHANGE MARKET':
      case 'MARKET':
        return 'market';
      case 'EXCHANGE LIMIT':
      case 'LIMIT':
        return 'limit';
      case 'EXCHANGE STOP LIMIT':
      case 'EXCHANGE STOP':
        return 'stop';
      case 'EXCHANGE TRAILING STOP':
      case 'TRAILING STOP':
        return 'trailing-stop';
    }

    return 'market';
  };

  private parseOrder = (data: BitfinexOrderMessageContent) => {
    const status = this.parseOrderStatus(data[13]);
    const base = this._ccxtInstance['safeCurrencyCode'](data[3].substr(1, 3));
    const quote = this._ccxtInstance['safeCurrencyCode'](data[3].substr(4, 3));
    const symbol = base + '/' + quote;
    let market: { symbol: string } = this._ccxtInstance.market(symbol);
    if (!market) {
      market = { symbol };
    }

    const order: Order = {
      id: data[0].toString(),
      clientId: data[2] ? data[2].toString() : undefined,
      symbol: market.symbol,
      timestamp: data[4],
      datetime: moment(data[4]).toISOString(),
      amount: Math.abs(data[7]),
      filled: Math.abs(data[7]) - Math.abs(data[6]),
      type: this.getOrderType(data[8]),
      cost: Math.abs(data[16] * data[7]),
      price: data[16],
      remaining: Math.abs(data[6]),
      side: data[7] > 0 ? 'buy' : 'sell',
      status,
      info: data,
    };

    return order;
  };

  private parseTrade = (data: BitfinexTradeMessageContent) => {
    const amount = Math.abs(data[4]);
    const price = data[5];
    const timestamp = data[2];

    const symbol = data[1].substr(1, 6);
    const trade: Trade = {
      id: data[0],
      timestamp,
      amount,
      price,
      takerOrMaker: data[8] === 1 ? 'maker' : 'taker',
      fee: {
        cost: Math.abs(data[9]),
        currency: data[10],
      },
      info: data,
      cost: price * amount,
      datetime: moment(timestamp).toISOString(),
      order: data[3],
      side: data[4] > 0 ? 'buy' : 'sell',
      symbol: this._ccxtInstance.marketsById[symbol] ? this._ccxtInstance.marketsById[symbol].symbol : symbol,
      type: this.getOrderType(data[6]),
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

  private parseBalance = (message: BitfinexWalletUpdateMessageContent): BalanceUpdate | undefined => {
    const currency = this._ccxtInstance['safeCurrencyCode'](message[1]);
    if (!this.isBalanceMatchingWalletType(message[0], currency)) {
      return undefined;
    }

    if (message[4] === null) {
      this.send(JSON.stringify([0, 'calc', null, [[`wallet_funding_${currency}`]]]));
      return undefined;
    }

    const free = new Decimal(message[4]);
    const total = new Decimal(message[2]);
    const used =
      !total.eq(free) && message[3] === 0 ? new Decimal(total).minus(free) : new Decimal(message[3]);

    return this._ccxtInstance['parseBalance']({
      [currency]: { free: free.toNumber(), total: total.toNumber(), used: used.toNumber() },
      info: message as any,
    });
  };

  private parsePositions = (info: BitfinexPositionMessageContent[]): PositionUpdate => {
    //  0 = Margin position, 1 = Derivatives position
    const positionType = this._walletType === 'margin' ? 0 : 1;

    const positions: PositionUpdate = info
      .filter((info: any) => {
        return info[15] === positionType && info[1] === 'ACTIVE';
      })
      .map((info: any) => {
        const symbol = this._ccxtInstance.marketsById[info[0]]
          ? this._ccxtInstance.marketsById[info[0]].symbol
          : info[0];

        // info[2]: Size of the position. A positive value indicates a long position;
        // a negative value indicates a short position.
        const amount = new Decimal(info[2] || 0).toNumber();
        // info[3]: Base price of the position. (Average traded price of the previous orders of the position)
        const entryPrice = new Decimal(info[3] || 0).toNumber();
        // info[6]: Profit & Loss
        const unrealizedPnl = new Decimal(info[6] || 0).toNumber();
        const side = amount >= 0 ? 'long' : 'short';
        const markPrice =
          amount !== 0
            ? new Decimal(entryPrice).plus(new Decimal(unrealizedPnl).div(amount).toString()).toNumber()
            : 0;

        return {
          entryPrice,
          markPrice,
          symbol,
          amount,
          side,
          info,
        };
      });

    return positions;
  };

  private isFutureSymbol = (symbol: string) => {
    const [base, quote] = symbol.split('/');
    return this.isFutureCurrency(base) && this.isFutureCurrency(quote);
  };

  private isFutureCurrency = (asset: string) => {
    return asset.endsWith('0');
  };

  private isBalanceMatchingWalletType = (balanceWallet: string, balanceCurrency: string) => {
    switch (this._walletType) {
      case 'future':
        return balanceWallet === 'margin' && this.isFutureCurrency(balanceCurrency);
      case 'margin':
        return balanceWallet === 'margin' && !this.isFutureCurrency(balanceCurrency);
      case 'spot':
      default:
        return balanceWallet === 'exchange';
    }
  };

  private isOrderMatchingWalletType = (order: Order) => {
    switch (this._walletType) {
      case 'future':
        return this.isFutureSymbol(order.symbol);
      case 'margin':
        return !this.isFutureSymbol(order.symbol) && !order.info[8].toLowerCase().startsWith('exchange');
      default:
        return !this.isFutureSymbol(order.symbol) && order.info[8].toLowerCase().startsWith('exchange');
    }
  };

  private isTradeMatchingWalletType = (trade: Trade) => {
    switch (this._walletType) {
      case 'future':
        return this.isFutureSymbol(trade.symbol);
      case 'margin':
        return !this.isFutureSymbol(trade.symbol) && !trade.info[6].toLowerCase().startsWith('exchange');
      default:
        return !this.isFutureSymbol(trade.symbol) && trade.info[6].toLowerCase().startsWith('exchange');
    }
  };
}
