const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

connectRedis();

module.exports = client;
