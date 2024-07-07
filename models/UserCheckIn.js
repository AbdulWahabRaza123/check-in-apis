const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCheckIn = sequelize.define('UserCheckIn', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
  },
  venueId: {
    type: DataTypes.INTEGER,
  },
  interest: {
    type: DataTypes.STRING,
  },
});

module.exports = UserCheckIn;
