const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const { getNifty500Stocks } = require('./stock.js');

// ✅ CPR Calculation
function calculateCPR(high, low, close, date) {
  const pivot = (high + low + close) / 3;
  const bc = (high + low) / 2;
  const tc = pivot - bc + pivot;
  const width = Math.abs(tc - bc);

  return { pivot, bc, tc, width, date };
}

// ✅ Narrow CPR Check
function isNarrowCPR(todayWidth, prevWidths) {
  return todayWidth <= Math.min(...prevWidths);
}

// ✅ CPR Type Detection
function getCPRType(today, yesterday, dayBeforeYesterday) {
  const { bc: tBC, tc: tTC, pivot: tP } = today;
  const { bc: yBC, tc: yTC, pivot: yP } = yesterday;
  const { bc: dyBC, tc: dyTC, pivot: dyP } = dayBeforeYesterday;
  var result = '';
  if (tBC > yTC) result = 'Higher Value (Bullish)';
  if (tTC < yBC) result = 'Lower Value (Bearish)';
  if (tTC <= yTC && tBC >= yBC) result = 'Inside Value';
  if (tBC <= yBC && tTC >= yTC) result = 'Outside Value';
  if (tP > yP) result = 'Overlapping Higher';
  if (tP < yP) result = 'Overlapping Lower';

  if (dyBC < yBC && yBC < tBC) result = `${result}  Ascending`;
  if (dyBC > yBC && yBC > tBC) result = `${result}  Descending`;

  return result;
}

// 🚀 Main Function
async function getNarrowCPRStocks() {
  const results = [];
  const stocks = await getNifty500Stocks();
  for (let stock of stocks) {
    try {
      const data = await yahooFinance.historical(stock, {
        period1: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 90 days ago
        period2: new Date(), // today
        // period2: new Date(new Date().setDate(new Date().getDate() - 1)), // yesterday
        interval: '1d',
      });

      if (data.length < 15) continue;

      // Last 12 days (today + yesterday + previous 10)
      const lastDays = data.slice(-12);

      // Calculate CPR for all days
      const cprData = lastDays.map((d) =>
        calculateCPR(d.high, d.low, d.close, d.date),
      );

      const today = cprData[cprData.length - 1];
      const yesterday = cprData[cprData.length - 2];
      const dayBeforeYesterday = cprData[cprData.length - 3];

      const prevWidths = cprData
        .slice(1, -1) // exclude today, keep last 10 days
        .map((d) => d.width);

      const isNarrow = isNarrowCPR(today.width, prevWidths);
      const cprType = getCPRType(today, yesterday, dayBeforeYesterday);

      if (
        isNarrow
        // ||
        // cprType.includes('Ascending') ||
        // cprType.includes('Descending')
      ) {
        results.push({
          stock,
          cprWidth: today.width.toFixed(2),
          cprType,
        });
      }
    } catch (err) {
      console.error(`Error fetching ${stock}:`, err.message);
    }
  }

  return results;
}

module.exports = {
  getNarrowCPRStocks,
};
