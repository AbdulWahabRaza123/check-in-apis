const Venue = require('../models/Venue');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const getCategoryCounts = async (venueId) => {
  const categories = ['Friends', 'Networking', 'Dates', 'Food', 'Parties', 'Events', 'Drinks'];
  const categoryCounts = {};

  for (const category of categories) {
    const count = await UserCheckIn.count({ where: { venueId, category } });
    categoryCounts[category] = count;
  }

  return categoryCounts;
};


exports.createVenue = async (req, res) => {
  try {
    const {
      venueName,
      address,
      openTime,
      closedTime,
      category,
      latitude,
      longitude,
      subTitle,
    } = req.body;

    const venue = await Venue.create({
      venueName,
      address,
      openTime,
      closedTime,
      category,
      latitude,
      longitude,
      subTitle,
    });
    res.status(201).json(venue);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get venue details or all venues
exports.getVenues = async (req, res) => {
  try {
    const { placeid } = req.query;

    if (placeid) {
      const venue = await Venue.findOne({ where: { placeId: placeid } });

      if(venue) {
        return res.status(200).json({
          status: true,
          message: 'Venue exists',
          venue,
        });
      }
      else {
        return res.status(200).json({
          status: false,
          message: 'Venue does not exist',
          venue: [],
        });
      }
    }
    else {
      const venues = await Venue.findAll();
      return res.status(200).json({
        status: true,
        message: 'All users fetched successfully',
        venues,
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

    let venue = await Venue.findOne({ where: { placeId } });

    if (!venue) {
      // Create new venue if it does not exist
      venue = await Venue.create({ placeId, totalCheckIns: 0 });
    }

    const existingCheckIn = await UserCheckIn.findOne({ where: { userId, venueId: venue.venueId } });

    if (existingCheckIn) {
      return res.status(409).json({ message: 'User already checked in' });
    }

    await UserCheckIn.create({ userId, venueId: venue.venueId, category });

    // Increment total check-ins for the venue
    venue.totalCheckIns += 1;
    await venue.save();

    res.status(200).json({ message: 'User checked in successfully' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
  }
};