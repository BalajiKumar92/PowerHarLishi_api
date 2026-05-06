// const axios = require("axios");

// const BASE_URL = "https://www.nseindia.com";

// const headers = {
//   "User-Agent": "Mozilla/5.0",
//   "Accept": "application/json",
//   "Accept-Language": "en-US,en;q=0.9",
//   "Connection": "keep-alive",
// };

// async function getCookies() {
//   const res = await axios.get(BASE_URL, { headers });
//   return res.headers["set-cookie"].join(";");
// }

// async function fetchSnapshot(type, cookies) {
//   const url = `${BASE_URL}/api/NextApi/apiClient?functionName=getMarketSnapshot&&type=${type}`;

//   const res = await axios.get(url, {
//     headers: {
//       ...headers,
//       Cookie: cookies,
//     },
//   });

//   return res.data;
// }

// async function getMarketData() {
//   try {
//     const cookies = await getCookies();

//     const [gainers, losers] = await Promise.all([
//       fetchSnapshot("G", cookies), // Gainers
//       fetchSnapshot("L", cookies), // Losers
//     ]);

//     return {
//       gainers: gainers?.data || [],
//       losers: losers?.data || [],
//     };
//   } catch (err) {
//     console.error("Error:", err.message);
//     return null;
//   }
// }

// // usage
// (async () => {
//   const data = await getMarketData();
//   console.log("Gainers:", data.gainers);
//   console.log("Losers:", data.losers);
// })();