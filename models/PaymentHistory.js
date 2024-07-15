const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentHistory = sequelize.define('PaymentHistory', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
        type: DataTypes.STRING
    },
    userId: {
        type: DataTypes.INTEGER
    },
    voucherId:{
        type: DataTypes.INTEGER
    },
  });
  
  module.exports = PaymentHistory;