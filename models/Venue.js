const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venue = sequelize.define('Venue', {
  venueId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  venueName: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  openTime: {
    type: DataTypes.STRING,
  },
  closedTime: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  latitude: {
    type: DataTypes.DOUBLE,
  },
  longitude: {
    type: DataTypes.DOUBLE,
  },
  subTitle: {
    type: DataTypes.STRING,
  },
});

module.exports = Venue;
