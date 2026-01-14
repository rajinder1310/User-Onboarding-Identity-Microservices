const { connectConsumer, consumer } = require('./src/config/kafka');
const { sendEmail } = require('./src/utils/emailSender');
const logger = require('./src/utils/logger');
const { getOtpTemplate } = require('./src/templates/otpTemplate');
require('dotenv').config();

const startService = async () => {
  try {
    // 1. Connect to Kafka Broker
    await connectConsumer();

    // 2. Subscribe to the 'send-otp' topic
    await consumer.subscribe({ topic: 'send-otp', fromBeginning: true });

    // 3. Start processing messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const msgContent = message.value.toString();
        logger.info(`Received message: ${msgContent}`);

        try {
          const { email, otp, name } = JSON.parse(msgContent);
          if (email && otp) {
            logger.info(`Sending OTP to ${email}`);

            // Generate HTML content using the template
            const htmlContent = getOtpTemplate(otp, name || 'User');

            // Send email via SendGrid
            await sendEmail(email, 'Verify Your Email - AntiGravity', `Your OTP is ${otp}`, htmlContent);
          } else {
            logger.error('Invalid message format (missing email or otp)');
          }
        } catch (err) {
          logger.error('Error parsing message:', err);
        }
      },
    });
  } catch (err) {
    logger.error('Failed to start email service', err);
  }
};

startService();

/**
 * Graceful Shutdown
 * Ensures clean disconnection from Kafka consumer group
 */
const gracefulShutdown = async () => {
  logger.info('Received kill signal, shutting down gracefully');
  try {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
