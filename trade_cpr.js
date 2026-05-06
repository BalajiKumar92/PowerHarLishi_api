const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const { getNifty500Stocks } = require('./stock.js');

const {
  calculateCPR,
  getWeeklyCandle,
  getTradeSetup,
  getCPRPosition,
  getPreviousWeekCandle,
} = require('./util.js');

const { exportToExcel } = require('./exportFile.js');

async function analyzeStock(stock) {
  try {
    const dayRes = await yahooFinance.chart(stock, {
      period1: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 90 days ago
      period2: new Date(), // today
      // period2: new Date(new Date().setDate(new Date().getDate() - 1)), // yesterday,
      interval: '1d',
    });

    const data = dayRes.quotes;
    if (data.length < 10) return null;

    const latest = data[data.length - 1];
    const prevDay = data[data.length - 2];

    // Daily CPR (based on previous day)
    const dailyCPR = calculateCPR(prevDay.high, prevDay.low, prevDay.close);

    // Weekly CPR
    const weeklyCandle = getPreviousWeekCandle(data.slice(0, -1));
    const weeklyCPR = calculateCPR(
      weeklyCandle.high,
      weeklyCandle.low,
      weeklyCandle.close,
    );

    const price = latest.close;

    const dailyPos = getCPRPosition(price, dailyCPR);
    const weeklyPos = getCPRPosition(price, weeklyCPR);

    const setup = getTradeSetup(weeklyPos, dailyPos);

    return {
      stock,
      price: price.toFixed(2),
      weekly: weeklyPos,
      daily: dailyPos,
      setup,
      dailyCPR,
      weeklyCPR,
    };
  } catch (err) {
    console.error(`Error ${stock}:`, err.message);
    return null;
  }
}

async function intraDayStock() {
  //   const stocks = ['BAJAJHFL.NS']; //

  const stocks = await getNifty500Stocks();
  const pLimit = (await import('p-limit')).default;

  const limit = pLimit(20); // 🔥 control concurrency (5–10 ideal)
  const promises = stocks.map((stock) => limit(() => analyzeStock(stock)));

  const results = (await Promise.all(promises)).filter(Boolean);

  console.table(results);

  return results;
}

module.exports = {
  intraDayStock,
};
