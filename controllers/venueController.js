const Venue = require("../models/Venue");
const UserCheckIn = require("../models/UserCheckIn");
const User = require("../models/User");
const UserPicture = require("../models/UserPicture");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility function to get category counts and checked-in users
const getCategoryCountsAndUsers = async (venueId) => {
  const categories = [
    "Friends",
    "Networking",
    "Dates",
    "Food",
    "Parties",
    "Events",
    "Drinks",
  ];
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

  const users = await User.findAll({
    where: { id: userIds },
    include: [UserPicture],
  });

  return { categoryCounts, users };
};

// Create a new venue
exports.createVenue = async (req, res) => {
  try {
    const { placeId } = req.body;

    let venue = await Venue.findOne({ where: { placeId } });

    if (venue) {
      return res
        .status(409)
        .json({ status: false, message: "Venue already exists" });
    }

    venue = await Venue.create({ placeId, totalCheckIns: 0 });

    res
      .status(201)
      .json({ status: true, message: "Venue created successfully", venue });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get venue details or all venues
exports.getVenues = async (req, res) => {
  try {
    let { placeid } = req.query;

    if (placeid) {
      placeid = placeid.split(",");
      const venuesWithDetails = [];

      // Fetch details for each placeid
      for (const id of placeid) {
        const venue = await Venue.findOne({ where: { placeId: id } });
        if (venue) {
          const { categoryCounts, users } = await getCategoryCountsAndUsers(
            venue.venueId
          );
          venuesWithDetails.push({
            ...venue.dataValues,
            categoryCounts,
            users,
          });
        }
      }

      if (venuesWithDetails.length > 0) {
        return res.status(200).json({
          status: true,
          message: "Venues found",
          venues: venuesWithDetails,
        });
      } else {
        return res.status(200).json({
          status: false,
          message: "No venues found for the given place IDs",
          venues: [],
        });
      }
    } else {
      // If no placeid query parameter is provided, return all venues
      const allVenues = await Venue.findAll();
      const allVenuesWithDetails = await Promise.all(
        allVenues.map(async (venue) => {
          const { categoryCounts, users } = await getCategoryCountsAndUsers(
            venue.venueId
          );
          return {
            ...venue.dataValues,
            categoryCounts,
            users,
          };
        })
      );

      return res.status(200).json({
        status: true,
        message: "All venues fetched successfully",
        venues: allVenuesWithDetails,
      });
    }
  } catch (error) {
    console.error("Error fetching venues: ", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Check in user to venue
exports.checkInUser = async (req, res) => {
  try {
    const { userId, placeId, category } = req.body;

    // Check if user exists using UId
    const user = await User.findOne({
      where: { UId: userId },
      include: [UserPicture],
    });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if user is already checked in at any venue
    const previousCheckIn = await UserCheckIn.findOne({
      where: { userId: user.id },
    });

    if (previousCheckIn) {
      // Decrement the total count for the previous venue, ensuring it does not go below zero
      const previousVenue = await Venue.findByPk(previousCheckIn.venueId);
      if (previousVenue.totalCheckIns > 0) {
        previousVenue.totalCheckIns -= 1;
      }
      await previousVenue.save();

      await UserCheckIn.destroy({
        where: { userId: user.id, venueId: previousVenue.venueId },
      });
    }

    let venue = await Venue.findOne({ where: { placeId } });

    if (!venue) {
      // Create new venue if it does not exist
      venue = await Venue.create({ placeId, totalCheckIns: 0 });
    }

    await UserCheckIn.create({
      userId: user.id,
      venueId: venue.venueId,
      category,
    });

    // Increment total check-ins for the venue
    venue.totalCheckIns += 1;
    await venue.save();

    // Fetch updated category counts and users
    const { categoryCounts, users } = await getCategoryCountsAndUsers(
      venue.venueId
    );

    res.status(200).json({
      status: true,
      message: "User checked in successfully",
      venue: {
        ...venue.dataValues,
        categoryCounts,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Check out user from venue
exports.checkOutUser = async (req, res) => {
  try {
    const { userId, placeId } = req.body;

    // Check if user exists using UId
    const user = await User.findOne({
      where: { UId: userId },
      include: [UserPicture],
    });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if the venue exists
    const venue = await Venue.findOne({ where: { placeId } });
    if (!venue) {
      return res
        .status(404)
        .json({ status: false, message: "Venue not found" });
    }

    // Check if user is checked in at the given venue
    const userCheckIn = await UserCheckIn.findOne({
      where: { userId: user.id, venueId: venue.venueId },
    });
    if (!userCheckIn) {
      return res.status(409).json({
        status: false,
        message: "User is not checked in at this venue",
      });
    }

    // Decrement the total count for the venue, ensuring it does not go below zero
    if (venue.totalCheckIns > 0) {
      venue.totalCheckIns -= 1;
    }
    await venue.save();

    // Remove the check-in entry
    await UserCheckIn.destroy({
      where: { userId: user.id, venueId: venue.venueId },
    });

    // Fetch updated category counts and users
    const { categoryCounts, users } = await getCategoryCountsAndUsers(
      venue.venueId
    );

    res.status(200).json({
      status: true,
      message: "User checked out successfully",
      venue: {
        ...venue.dataValues,
        categoryCounts,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
