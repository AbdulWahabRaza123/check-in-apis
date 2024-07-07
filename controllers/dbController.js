const User = require('../models/User');
const UserCheckIn = require('../models/UserCheckIn');
const UserPicture = require('../models/UserPicture');
const Venue = require('../models/Venue');

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