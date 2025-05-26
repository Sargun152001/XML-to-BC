require('dotenv').config(); // 👈 Add this first line

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3001;

const allowedOrigins = [
  'https://xml-to-bc-frontend.onrender.com',
  'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl or mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
}));


app.use(express.json());

// ✅ Load secrets from environment variables
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const scope = process.env.SCOPE;

app.get('/', (req, res) => {
  res.send('Token proxy server running. Use POST /token to get an access token.');
});

app.post('/token', async (req, res) => {
  try {
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', scope);

    const response = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error('Error getting token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

app.listen(port, () => {
  console.log(`✅ Token proxy server running on http://localhost:${port}`);
});
