const Venue = require('../models/Venue');
const VenueCity = require('../models/VenueCity');
const VenuePicture = require('../models/VenuePicture');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createVenue = async (venueData, venueFiles, venueCities) => {
  const { venueName, address, openTime, closedTime, category, latitude, longitude, subTitle } = venueData;

  const venue = await Venue.create({ venueName, address, openTime, closedTime, category, latitude, longitude, subTitle });

  if (venueFiles) {
    for (const file of venueFiles) {
      const uploadResult = await cloudinary.uploader.upload(file.path);
      await VenuePicture.create({ venueId: venue.venueId, imageUrl: uploadResult.secure_url });
    }
  }

  if (venueCities) {
    for (const city of venueCities) {
      await VenueCity.create({ venueId: venue.venueId, city: city.city, latitude: city.latitude, longitude: city.longitude });
    }
  }

  return venue;
};

exports.getVenuesWithinRadiusAndCity = async (latitude, longitude, radius, city) => {
  // Implement the logic to get venues within the specified radius and city
  // This might involve some geospatial queries with Sequelize

  // Dummy implementation:
  const venues = await Venue.findAll({
    where: {
      latitude: {
        [Op.between]: [latitude - radius, latitude + radius],
      },
      longitude: {
        [Op.between]: [longitude - radius, longitude + radius],
      },
      city,
    },
  });

  return venues;
};

exports.getVenueById = async (venueId, currentTime) => {
  const venue = await Venue.findByPk(venueId);
  if (!venue) {
    throw new Error('Venue not found');
  }

  const venuePictures = await VenuePicture.findAll({ where: { venueId } });
  const venueCities = await VenueCity.findAll({ where: { venueId } });
  const userCheckIns = await UserCheckIn.findAll({ where: { venueId } });

  const totalCheckIns = userCheckIns.length;
  const interestCounts = userCheckIns.reduce((acc, checkIn) => {
    acc[checkIn.interest] = (acc[checkIn.interest] || 0) + 1;
    return acc;
  }, {});

  const status = getStatus(venue.openTime, venue.closedTime, currentTime);

  return {
    venue,
    pictures: venuePictures,
    cities: venueCities,
    totalCheckIns,
    interestCounts,
    status,
  };
};

const getStatus = (openTime, closedTime, currentTime) => {
  const open = LocalTime.parse(openTime);
  const close = LocalTime.parse(closedTime);
  if (currentTime.isAfter(open) && currentTime.isBefore(close)) {
    return 'Open';
  } else {
    return 'Closed';
  }
};
