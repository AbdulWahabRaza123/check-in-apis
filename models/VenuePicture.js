const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VenuePicture = sequelize.define('VenuePicture', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  venueId: {
    type: DataTypes.INTEGER,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
});

module.exports = VenuePicture;
