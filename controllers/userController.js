const User = require('../models/User');
const UserCheckIn = require('../models/UserCheckIn');
const UserPicture = require('../models/UserPicture');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.signUp = async (req, res) => {
  try {
    const {
      UId,
      name,
      number,
      description,
      gender,
      sex,
      activeStatus,
      packageId,
      date,
      email,
      age,
    } = req.body;


    const userExists = await User.findOne({ where: { UId } });

    if (userExists) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({
      UId,
      name,
      number,
      description,
      gender,
      sex,
      activeStatus,
      packageId,
      date,
      email,
      age,
    });

    if (req.files && req.files.length>0) {
      for (const file of req.files) {

        const uploadResult = await cloudinary.uploader.upload(file.path);
        await UserPicture.create({
          userId: user.id,
          imageUrl: uploadResult.secure_url,
        });

        console.log("Uploaded file to Cloudinary: ", uploadResult.secure_url);
      }
    }


    res.status(200).json({ message: 'User signed up successfully' });

    
  } catch (error) {
    res.status(500).json({ message: 'File uploading failed for user', error: error.message });
  }
};

exports.saveUserCheckIn = async (req, res) => {
  try {
    const { userId, venueId, interest } = req.body;

    const venue = await Venue.findByPk(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingCheckIn = await UserCheckIn.findOne({ where: { userId, venueId } });
    if (existingCheckIn) {
      return res.status(409).json({ message: 'User already checked in' });
    }

    await UserCheckIn.create({ userId, venueId, interest });

    res.status(200).json({ message: 'User checked in successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { uid } = req.query;

    if (uid) {
      const user = await User.findOne({ where: { UId: uid } });
      if (user) {
        return res.status(200).json({
          status: true,
          message: 'User exists',
          user,
        });
      } else {
        return res.status(200).json({
          status: false,
          message: 'User does not exist',
          user: [],
        });
      }
    } else {
      const users = await User.findAll();
      return res.status(200).json({
        status: true,
        message: 'All users fetched successfully',
        users,
      });
    }
  }
  catch (error) {
    res.status(500).json({ message: 'Internal serve error'});
  }
}