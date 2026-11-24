const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const isTest = config.env === 'test';

/**
 * General API Rate Limiter
 * 300 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  skip: () => isTest
});

/**
 * Stricter Authentication Rate Limiter
 * Protects login, registration, password resets from brute-force attacks
 * 25 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before retrying.'
  },
  skip: () => isTest
});

module.exports = {
  apiLimiter,
  authLimiter
};
