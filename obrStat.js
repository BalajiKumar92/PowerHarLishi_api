const SmartAPI = require('smartapi-javascript');

const smartApi = new SmartAPI({ api_key: 'YOUR_API_KEY' });

let accessToken = '';
let candleHigh = 0;
let candleLow = 0;

let tradePlaced = false;
let entryPrice = 0;
let targetPrice = 0;
let stopLossPrice = 0;

// LOGIN
async function login() {
  const session = await smartApi.generateSession(
    'CLIENT_ID',
    'PASSWORD',
    'TOTP',
  );

  accessToken = session.data.jwtToken;
  smartApi.setAccessToken(accessToken);
}

// FETCH 30 MIN CANDLE
async function get30MinCandle() {
  const res = await smartApi.getCandleData({
    exchange: 'NSE',
    symboltoken: '26000',
    interval: 'THIRTY_MINUTE',
    fromdate: '2026-04-28 09:15',
    todate: '2026-04-28 15:30',
  });

  const candles = res.data;
  const last = candles[candles.length - 1];

  candleHigh = last[2];
  candleLow = last[3];

  console.log('High:', candleHigh, 'Low:', candleLow);
}

// GET LTP (OPTION)
async function getOptionLTP() {
  const res = await smartApi.ltpData({
    exchange: 'NFO',
    tradingsymbol: 'NIFTY25APR18000CE',
    symboltoken: '123456',
  });

  return res.data.ltp;
}

// PLACE BUY
async function placeBuyOrder() {
  const orderParams = {
    variety: 'NORMAL',
    tradingsymbol: 'NIFTY25APR18000CE',
    symboltoken: '123456',
    transactiontype: 'BUY',
    exchange: 'NFO',
    ordertype: 'MARKET',
    producttype: 'INTRADAY',
    duration: 'DAY',
    quantity: '50',
  };

  const order = await smartApi.placeOrder(orderParams);
  console.log('BUY ORDER:', order);
}

// PLACE SELL
async function placeSellOrder() {
  const orderParams = {
    variety: 'NORMAL',
    tradingsymbol: 'NIFTY25APR18000CE',
    symboltoken: '123456',
    transactiontype: 'SELL',
    exchange: 'NFO',
    ordertype: 'MARKET',
    producttype: 'INTRADAY',
    duration: 'DAY',
    quantity: '50',
  };

  const order = await smartApi.placeOrder(orderParams);
  console.log('SELL ORDER:', order);
}

// MAIN
async function startStrategy() {
  await login();
  await get30MinCandle();

  setInterval(async () => {
    try {
      const indexLtpRes = await smartApi.ltpData({
        exchange: 'NSE',
        tradingsymbol: 'NIFTY',
        symboltoken: '26000',
      });

      const indexLTP = indexLtpRes.data.ltp;

      // ENTRY CONDITION
      if (indexLTP > candleHigh && !tradePlaced) {
        console.log('BREAKOUT 🚀');

        await placeBuyOrder();

        // Assume immediate fill (better: fetch order book)
        entryPrice = await getOptionLTP();

        const slPoints = (candleHigh - candleLow) / 2;

        targetPrice = entryPrice + 15;
        stopLossPrice = entryPrice - slPoints;

        console.log('Entry:', entryPrice);
        console.log('Target:', targetPrice);
        console.log('SL:', stopLossPrice);

        tradePlaced = true;
      }

      // EXIT LOGIC
      if (tradePlaced) {
        const ltp = await getOptionLTP();

        if (ltp >= targetPrice) {
          console.log('TARGET HIT 🎯');
          await placeSellOrder();
          tradePlaced = false;
        }

        if (ltp <= stopLossPrice) {
          console.log('STOP LOSS HIT 🛑');
          await placeSellOrder();
          tradePlaced = false;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, 3000);
}

startStrategy();
