const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'email-service',
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: 'email-group' });

const connectConsumer = async () => {
  await consumer.connect();
  console.log('Connected to Kafka Consumer');
};

module.exports = { consumer, connectConsumer };
