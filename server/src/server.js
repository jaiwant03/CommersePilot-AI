const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');

const startServer = async () => {
  try {
    // Attempt Database connection
    await connectDB();

    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`
=====================================================
🚀 CommercePilot AI Server Running
🌍 Environment : ${config.env}
🔌 Port        : ${config.port}
🌐 Base URL    : http://localhost:${config.port}
🩺 Health Check: http://localhost:${config.port}/api/health
=====================================================
      `);
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('Stopping server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
