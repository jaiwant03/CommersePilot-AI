const cors = require('cors');
const config = require('../config/env');

const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (
      allowedOrigins.indexOf(origin) !== -1 || 
      config.env === 'development' ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CommercePilot-Secret',
    'X-Idempotency-Key'
  ]
};

module.exports = cors(corsOptions);
