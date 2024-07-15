const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserVoucher = require('./UserVoucher');
const User = require('./User');

const Voucher = sequelize.define('Voucher', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        },
    name: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING
    },
    //expiry time in days
    expiryTime: {
        type: DataTypes.INTEGER
    }
});

module.exports = Voucher;