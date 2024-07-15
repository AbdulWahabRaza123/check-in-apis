// models/UserPicture.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserVoucher = sequelize.define('UserVoucher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  voucherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = UserVoucher;
