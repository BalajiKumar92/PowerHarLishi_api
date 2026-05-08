const express = require('express');
const cors = require('cors');
const { intraDayStock } = require('./trade_cpr');
const { weekSwingStock } = require('./weekTrade');
const { getNarrowCPRStocks } = require('./cpr');

const app = express();
app.use(cors());

app.get('/api/cpr-d-narrow', async (req, res) => {
  try {
    const result = await getNarrowCPRStocks();
    res.status(200).send({ stocks: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cpr-intraday', async (req, res) => {
  try {
    const result = await intraDayStock();
    res.status(200).send({ stocks: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cpr-w-swing', async (req, res) => {
  try {
    const result = await weekSwingStock();
    res.status(200).send({ stocks: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
