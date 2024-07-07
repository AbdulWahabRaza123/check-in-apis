const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPicture = sequelize.define('UserPicture', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
});

module.exports = UserPicture;
