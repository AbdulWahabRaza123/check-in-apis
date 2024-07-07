// services/venueService.js
const Venue = require('../models/Venue');
const UserCheckIn = require('../models/UserCheckIn');

exports.getCategoryCounts = async (venueId) => {
  const categories = ['Friends', 'Networking', 'Dates', 'Food', 'Parties', 'Events', 'Drinks'];
  const categoryCounts = {};

  for (const category of categories) {
    const count = await UserCheckIn.count({ where: { venueId, category } });
    categoryCounts[category] = count;
  }

  return categoryCounts;
};

exports.checkInUser = async (userId, placeId, category) => {
  let venue = await Venue.findOne({ where: { placeId } });

  if (!venue) {
    // Create new venue if it does not exist
    venue = await Venue.create({ placeId, totalCheckIns: 0 });
  }

  const existingCheckIn = await UserCheckIn.findOne({ where: { userId, venueId: venue.venueId } });

  if (existingCheckIn) {
    throw new Error('User already checked in');
  }

  await UserCheckIn.create({ userId, venueId: venue.venueId, category });

  // Increment total check-ins for the venue
  venue.totalCheckIns += 1;
  await venue.save();

  return venue;
};
