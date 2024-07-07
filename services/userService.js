const User = require('../models/User');
const UserCheckIn = require('../models/UserCheckIn');
const UserPicture = require('../models/UserPicture');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.signUp = async (userData, profilePicFiles) => {
  const { UId, name, number, description, gender, sex, activeStatus, packageId, date, email, age } = userData;
  const userExists = await User.findOne({ where: { UId } });

  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({ UId, name, number, description, gender, sex, activeStatus, packageId, date, email, age });

  if (profilePicFiles) {
    console.log("IMages Recieved")
    for (const file of profilePicFiles) {
      const uploadResult = await cloudinary.uploader.upload(file.path);
      await UserPicture.create({ userId: user.id, imageUrl: uploadResult.secure_url });
    }
  }

  return user;
};

exports.saveUserCheckIn = async (checkInData) => {
  const { userId, venueId, interest } = checkInData;

  const venue = await Venue.findByPk(venueId);
  if (!venue) {
    throw new Error('Venue not found');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const existingCheckIn = await UserCheckIn.findOne({ where: { userId, venueId } });
  if (existingCheckIn) {
    throw new Error('User already checked in');
  }

  const userCheckIn = await UserCheckIn.create({ userId, venueId, interest });

  return userCheckIn;
};
