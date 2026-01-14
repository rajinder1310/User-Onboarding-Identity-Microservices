const express = require('express');
require('./config/db'); // Initialize DB connection
require('./config/redis'); // Initialize Redis connection
const { connectKafka } = require('./config/kafka');

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security Middleware: Helmet helps secure the app by setting various HTTP headers
app.use(helmet());

// Security Middleware: CORS allows cross-origin requests
app.use(cors());

app.use(express.json()); // Parse JSON bodies

// Request logging using Morgan (streaming to Winston logger)
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting to prevent brute force attacks (100 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/auth', limiter);

// Mount authentication routes
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'user-service' });
});

// Connect to Kafka Producer
connectKafka().catch(err => console.error(err));

module.exports = app;
