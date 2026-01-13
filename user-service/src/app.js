require('./config/db');
require('./config/redis');

const authRoutes = require('./src/routes/authRoutes');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'user-service' });
});

connectKafka().catch(err => console.error(err));

module.exports = app;
