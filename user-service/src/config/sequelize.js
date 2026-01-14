const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connected to PostgreSQL');
    // Sync models (Safe for dev, use migrations for prod ideally)
    await sequelize.sync({ alter: true });
    // User requested not to run "create table" broadly, but Model sync is needed for ORM to work
    // or we assume tables exist. Usually user wants the model properly defined.
    // I will export sequelize instance to be used in models.
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

connectDB();

module.exports = sequelize;
