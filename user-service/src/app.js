const express = require('express');
const { connectKafka } = require('./config/kafka');
require('./config/db'); // Initialize DB pool
require('./config/redis'); // Initialize Redis

const app = express();

app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'user-service' });
});

// Start Kafka Producer
connectKafka().catch(err => console.error(err));

module.exports = app;
