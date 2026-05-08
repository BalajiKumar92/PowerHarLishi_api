const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const { getNifty500Stocks } = require('./stock.js');

const {
  calculateCPR,
  getWeeklyCandle,
  getTradeSetup,
  getCPRPosition,
  getPreviousWeekCandle,
  getPreviousMonthCandle,
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

    const price = latest.close;

    // Weekly CPR
    const weeklyCandle = getPreviousWeekCandle(data.slice(0, -1));
    const weeklyCPR = calculateCPR(
      weeklyCandle.high,
      weeklyCandle.low,
      weeklyCandle.close,
    );

    const monthlyCandle = getPreviousMonthCandle(data.slice(0, -1));
    const monthlyCPR = calculateCPR(
      monthlyCandle.high,
      monthlyCandle.low,
      monthlyCandle.close,
    );

    const weeklyPos = getCPRPosition(price, weeklyCPR);
    const monthlyPos = getCPRPosition(price, monthlyCPR);

    const setup = getTradeSetup(monthlyPos, weeklyPos);

    return {
      stock,
      price: price ? price.toFixed(2) : price,
      weekly: weeklyPos,
      month: monthlyPos,
      setup,
      weeklyCPR,
      monthlyCPR,
    };
  } catch (err) {
    console.error(`Error ${stock}:`, err.message);
    return null;
  }
}

async function weekSwingStock() {
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
  weekSwingStock,
};
