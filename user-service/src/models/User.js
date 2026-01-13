const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  timestamps: true, // adds created_at and updated_at
  underscored: true, // stores as created_at instead of createdAt
});

// Sync the model with the database (Creates table if not exists)
// The user said "database query remove krdo" earlier but now says "entity bnana hai".
// Usually one runs User.sync() or sequelize.sync(). 
// I'll leave the sync call commented out in the main app unless requested, 
// or I can put it here to ensure the table structure matches the Entity.
// User said "query hum code mai lgayege jab signup bad verify hoga".
// So I will just define the model here.

module.exports = User;
