const express = require('express');
const cors = require('cors');
const { intraDayStock } = require('./trade_cpr');

const app = express();
app.use(cors());

app.get('/api/cpr-intraday', async (req, res) => {
  try {
    const result = await intraDayStock();
    res.status(200).send({ intraday: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
