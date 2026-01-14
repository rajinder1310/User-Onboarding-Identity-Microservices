const app = require('./src/app');
const { pool } = require('./src/config/db');
const redisClient = require('./src/config/redis');
const { producer } = require('./src/config/kafka');
const logger = require('./src/utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`User Service running on port ${PORT}`);
});

const gracefulShutdown = async () => {
  logger.info('Received kill signal, shutting down gracefully');
  server.close(async () => {
    logger.info('Closed out remaining connections');
    try {
      await pool.end();
      logger.info('PostgreSQL pool closed');

      if (redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Redis client disconnected');
      }

      await producer.disconnect();
      logger.info('Kafka producer disconnected');

      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', err);
      process.exit(1);
    }
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
