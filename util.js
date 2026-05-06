// ✅ CPR Calculation
function calculateCPR(high, low, close) {
  const pivot = (high + low + close) / 3;
  const bc = (high + low) / 2;
  const tc = pivot - bc + pivot;
  const width = Math.abs(tc - bc);

  return { pivot, bc, tc, width };
}

// function getWeeklyCandle(data) {
//   const last5 = data.slice(-5);

//   const high = Math.max(...last5.map((d) => d.high));
//   const low = Math.min(...last5.map((d) => d.low));
//   const close = last5[last5.length - 1].close;

//   return { high, low, close };
// }

function getWeeklyCandle(data) {
  if (!data || data.length === 0) return null;

  // Convert to Date objects
  const candles = data.map((d) => ({
    ...d,
    dateObj: new Date(d.date),
  }));

  // Get latest date
  const latestDate = candles[candles.length - 1].dateObj;

  // Find Monday of current week
  const day = latestDate.getDay(); // 0=Sun, 1=Mon
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(latestDate);
  monday.setDate(latestDate.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  // Filter only this week's candles
  const weeklyCandles = candles.filter((d) => d.dateObj >= monday);

  if (weeklyCandles.length === 0) return null;

  const high = Math.max(...weeklyCandles.map((d) => d.high));
  const low = Math.min(...weeklyCandles.map((d) => d.low));
  const close = weeklyCandles[weeklyCandles.length - 1].close;

  return { high, low, close };
}

function getPreviousWeekCandle(data) {
  if (!data || data.length === 0) return null;

  const candles = data.map((d) => ({
    ...d,
    dateObj: new Date(d.date),
  }));

  const latestDate = candles[candles.length - 1].dateObj;

  // 👉 Find current week Monday
  const day = latestDate.getDay(); // 0=Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const currentMonday = new Date(latestDate);
  currentMonday.setDate(latestDate.getDate() + diffToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  // 👉 Previous week range
  const prevMonday = new Date(currentMonday);
  prevMonday.setDate(currentMonday.getDate() - 7);

  const prevFriday = new Date(currentMonday);
  prevFriday.setDate(currentMonday.getDate() - 1);
  prevFriday.setHours(23, 59, 59, 999);

  // 👉 Filter previous week candles
  const prevWeekCandles = candles.filter(
    (d) => d.dateObj >= prevMonday && d.dateObj <= prevFriday,
  );

  if (prevWeekCandles.length === 0) return null;

  const high = Math.max(...prevWeekCandles.map((d) => d.high));
  const low = Math.min(...prevWeekCandles.map((d) => d.low));
  const close = prevWeekCandles[prevWeekCandles.length - 1].close;

  return { high, low, close };
}

function getTradeSetup(weekly, daily) {
  if (weekly === 'ABOVE' && daily === 'ABOVE') return 'Strong Bullish';
  if (weekly === 'BELOW' && daily === 'BELOW') return 'Strong Bearish';
  if (weekly === 'BELOW' && daily === 'ABOVE') return 'Bullish';
  if (weekly === 'ABOVE' && daily === 'BELOW') return 'Bearish';
  if (weekly === 'INSIDE' && daily === 'INSIDE') return 'No Clear Signal';
  if (weekly === 'INSIDE') return 'Weak Bullish/Bearish';

  return 'Neutral';
}

function getCPRPosition(price, cpr) {
  if (price > cpr.tc) return 'ABOVE';
  if (price < cpr.bc) return 'BELOW';
  return 'INSIDE';
}

module.exports = {
  calculateCPR,
  getWeeklyCandle,
  getTradeSetup,
  getCPRPosition,
  getPreviousWeekCandle,
};
