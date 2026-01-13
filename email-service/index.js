const { connectConsumer, consumer } = require('./src/config/kafka');
require('dotenv').config();

const startService = async () => {
  await connectConsumer();

  await consumer.subscribe({ topic: 'send-otp', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()}`);
    },
  });
};

startService().catch(console.error);
