const axios = require('axios');
const csv = require('csv-parser');

async function getNifty500Stocks() {
  const url =
    'https://archives.nseindia.com/content/indices/ind_nifty100list.csv';

  const response = await axios.get(url, { responseType: 'stream' });

  return new Promise((resolve, reject) => {
    const stocks = [];

    response.data
      .pipe(csv())
      .on('data', (row) => {
        if (row.Symbol) {
          // Convert to Yahoo format
          stocks.push(`${row.Symbol}.NS`);
        }
      })
      .on('end', () => {
        resolve(stocks);
      })
      .on('error', reject);
  });
}

module.exports = {
  getNifty500Stocks,
};
