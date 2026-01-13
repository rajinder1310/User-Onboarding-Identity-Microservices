const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

const connectKafka = async () => {
  await producer.connect();
  console.log('Connected to Kafka Producer');
};

const sendEvent = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify(message) },
      ],
    });
    console.log(`Message sent to topic ${topic}`);
  } catch (error) {
    console.error('Error sending message to Kafka', error);
  }
};

module.exports = { connectKafka, sendEvent };
