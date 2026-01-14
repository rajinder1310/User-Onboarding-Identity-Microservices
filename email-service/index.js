const { connectConsumer, consumer } = require('./src/config/kafka');
const { sendEmail } = require('./src/utils/emailSender');
const logger = require('./src/utils/logger');
const { getOtpTemplate } = require('./src/templates/otpTemplate');
require('dotenv').config();

const startService = async () => {
  try {
    await connectConsumer();

    await consumer.subscribe({ topic: 'send-otp', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const msgContent = message.value.toString();
        logger.info(`Received message: ${msgContent}`);

        try {
          const { email, otp, name } = JSON.parse(msgContent); // Added name if available, fallback handled in template
          if (email && otp) {
            logger.info(`Sending OTP to ${email}`);
            const htmlContent = getOtpTemplate(otp, name || 'User');
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
