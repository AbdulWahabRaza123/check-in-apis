const User = require('../models/User');
const UserCheckIn = require('../models/UserCheckIn');
const UserPicture = require('../models/UserPicture');
const Venue = require('../models/Venue');

// Mapping of table names to models
const tableModels = {
  users: User,
  userCheckIns: UserCheckIn,
  userPictures: UserPicture,
  venues: Venue,
};

exports.deleteAllUsers = async (req, res) => {
  try {
    await User.destroy({ where: {}, truncate: true });
    await UserCheckIn.destroy({ where: {}, truncate: true });
    await UserPicture.destroy({ where: {}, truncate: true });
    res.status(200).json({ message: 'All users deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteAllTables = async (req, res) => {
  try {
    await User.drop();
    await UserCheckIn.drop();
    await UserPicture.drop();
    await Venue.drop();
    res.status(200).json({ message: 'All tables deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// New controller to delete a specific table
exports.deleteTable = async (req, res) => {
  const { tableName } = req.params;
  const model = tableModels[tableName];

  if (!model) {
    return res.status(400).json({ message: 'Invalid table name' });
  }

  try {
    await model.drop();
    res.status(200).json({ message: `Table ${tableName} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// New controller to clear all data in a specific table
exports.clearTable = async (req, res) => {
  const { tableName } = req.params;
  const model = tableModels[tableName];

  if (!model) {
    return res.status(400).json({ message: 'Invalid table name' });
  }

  try {
    await model.destroy({ where: {}, truncate: true });
    res.status(200).json({ message: `All data in table ${tableName} cleared successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
