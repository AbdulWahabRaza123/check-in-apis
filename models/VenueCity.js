const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VenueCity = sequelize.define('VenueCity', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  venueId: {
    type: DataTypes.INTEGER,
  },
  city: {
    type: DataTypes.STRING,
  },
  latitude: {
    type: DataTypes.DOUBLE,
  },
  longitude: {
    type: DataTypes.DOUBLE,
  },
});

module.exports = VenueCity;
