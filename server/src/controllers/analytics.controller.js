const analyticsService = require('../services/analyticsService');
const forecastingService = require('../services/forecastingService');

/**
 * Generate analytics telemetry for charts and performance breakdowns
 */
const getAnalytics = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { range = '30d' } = req.query;

    const data = await analyticsService.getStoreAnalytics(storeId, range);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Dedicated Demand Forecasting and Reorder Point endpoint
 */
const getForecasts = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { lookback = 30 } = req.query;

    const data = await forecastingService.forecastStoreDemand(storeId, parseInt(lookback, 10));
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getForecasts
};
