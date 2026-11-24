const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const routes = require('./routes');
const config = require('./config/env');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(corsMiddleware);

// Cookie Parsing for secure HTTP-only cookies
app.use(cookieParser());

// Request Logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'CommercePilot AI API',
    tagline: 'Your Ecommerce Business. On Autopilot.',
    version: '0.1.0',
    documentation: '/api/health',
    status: 'operational'
  });
});

// API Routes
app.use('/api', routes);

// 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
