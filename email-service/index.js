const { connectConsumer, consumer } = require('./src/config/kafka');
const { sendEmail } = require('./src/utils/emailSender');
require('dotenv').config();

const startService = async () => {
  await connectConsumer();

  await consumer.subscribe({ topic: 'send-otp', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msgContent = message.value.toString();
      console.log(`Received message: ${msgContent}`);

      try {
        const { email, otp } = JSON.parse(msgContent);
        if (email && otp) {
          console.log(`Sending OTP ${otp} to ${email}`);
          await sendEmail(email, 'Your OTP Code', `Your OTP for registration is: ${otp}`);
        } else {
          console.error('Invalid message format (missing email or otp)');
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    },
  });
};

startService().catch(console.error);
