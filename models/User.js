// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserPicture = require('./UserPicture');
const Request = require('./Request');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  UId: {
    type: DataTypes.STRING,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  number: {
    type: DataTypes.BIGINT,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
  },
  gender: {
    type: DataTypes.STRING,
  },
  sex: {
    type: DataTypes.STRING,
  },
  activeStatus: {
    type: DataTypes.STRING,
  },
  packageId: {
    type: DataTypes.INTEGER,
  },
  date: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  age: {
    type: DataTypes.INTEGER,
  },
});

User.hasMany(UserPicture, { foreignKey: 'userId' });
UserPicture.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Request, { as: 'SentRequests', foreignKey: 'sender_id', onDelete: 'CASCADE' });
User.hasMany(Request, { as: 'ReceivedRequests', foreignKey: 'receiver_id', onDelete: 'CASCADE' });
Request.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id', onDelete: 'CASCADE' });
Request.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id', onDelete: 'CASCADE' });

module.exports = User;
