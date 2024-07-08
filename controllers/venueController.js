// controllers/venueController.js
const Venue = require('../models/Venue');
const UserCheckIn = require('../models/UserCheckIn');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility function to get category counts and checked-in users
const getCategoryCountsAndUsers = async (venueId) => {
  const categories = ['Friends', 'Networking', 'Dates', 'Food', 'Parties', 'Events', 'Drinks'];
  const categoryCounts = {};
  const userIds = [];

  for (const category of categories) {
    const count = await UserCheckIn.count({ where: { venueId, category } });
    categoryCounts[category] = count;
  }

  const userCheckIns = await UserCheckIn.findAll({ where: { venueId } });

  for (const checkIn of userCheckIns) {
    userIds.push(checkIn.userId);
  }

  const users = await User.findAll({ where: { id: userIds } });

  return { categoryCounts, users };
};

// Create a new venue
exports.createVenue = async (req, res) => {
  try {
    const { placeId } = req.body;

    let venue = await Venue.findOne({ where: { placeId } });

    if (venue) {
      return res.status(409).json({ status: false, message: 'Venue already exists' });
    }

    venue = await Venue.create({ placeId, totalCheckIns: 0 });

    res.status(201).json({ status: true, message: 'Venue created successfully', venue });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
  }
};

// Get venue details or all venues
exports.getVenues = async (req, res) => {
  try {
    const { placeid } = req.query;

    if (placeid) {
      const venue = await Venue.findOne({ where: { placeId: placeid } });

      if (venue) {
        const { categoryCounts, users } = await getCategoryCountsAndUsers(venue.venueId);
        return res.status(200).json({
          status: true,
          message: 'Venue exists',
          venue: {
            ...venue.dataValues,
            categoryCounts,
            users,
          },
        });
      } else {
        return res.status(200).json({
          status: false,
          message: 'Venue does not exist',
          venue: [],
        });
      }
    } else {
      const venues = await Venue.findAll();
      const venuesWithDetails = await Promise.all(
        venues.map(async (venue) => {
          const { categoryCounts, users } = await getCategoryCountsAndUsers(venue.venueId);
          return {
            ...venue.dataValues,
            categoryCounts,
            users,
          };
        })
      );

      return res.status(200).json({
        status: true,
        message: 'All venues fetched successfully',
        venues: venuesWithDetails,
      });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
  }
};

// Check in user to venue
exports.checkInUser = async (req, res) => {
  try {
    const { userId, placeId, category } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Check if user is already checked in at any venue
    const previousCheckIn = await UserCheckIn.findOne({ where: { userId } });

    if (previousCheckIn) {
      // Decrement the total count and category count for the previous venue
      const previousVenue = await Venue.findByPk(previousCheckIn.venueId);
      previousVenue.totalCheckIns -= 1;
      await previousVenue.save();

      await UserCheckIn.destroy({ where: { userId, venueId: previousVenue.venueId } });
    }

    let venue = await Venue.findOne({ where: { placeId } });

    if (!venue) {
      // Create new venue if it does not exist
      venue = await Venue.create({ placeId, totalCheckIns: 0 });
    }

    await UserCheckIn.create({ userId, venueId: venue.venueId, category });

    // Increment total check-ins for the venue
    venue.totalCheckIns += 1;
    await venue.save();

    // Fetch updated category counts and users
    const { categoryCounts, users } = await getCategoryCountsAndUsers(venue.venueId);

    res.status(200).json({
      status: true,
      message: 'User checked in successfully',
      venue: {
        ...venue.dataValues,
        categoryCounts,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
  }
};
