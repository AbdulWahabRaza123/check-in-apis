const Venue = require('../models/Venue');
const VenueCity = require('../models/VenueCity');
const VenuePicture = require('../models/VenuePicture');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    if (req.files && req.files.files) {
      for (const file of req.files.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path);
        await VenuePicture.create({
          venueId: venue.venueId,
          imageUrl: uploadResult.secure_url,
        });
      }
    }

    if (req.body.venueCities) {
      const venueCities = JSON.parse(req.body.venueCities);
      for (const city of venueCities) {
        await VenueCity.create({
          venueId: venue.venueId,
          city: city.city,
          latitude: city.latitude,
          longitude: city.longitude,
        });
      }
    }

    res.status(201).json(venue);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getVenuesWithinRadiusAndCity = async (req, res) => {
  try {
    const { latitude, longitude, radius, city } = req.query;

    // Implement the logic to get venues within the specified radius and city
    // This might involve some geospatial queries with Sequelize

    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getVenueById = async (req, res) => {
  try {
    const { venueId } = req.params;
    const venue = await Venue.findByPk(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Implement the logic to get venue details including pictures and cities
    // Also, calculate the status based on open and closed times

    res.status(200).json(venueDetails);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
