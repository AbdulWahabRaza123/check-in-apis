// controllers/userController.js
const User = require('../models/User');
const UserCheckIn = require('../models/UserCheckIn');
const UserPicture = require('../models/UserPicture');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const {generateToken} = require('../utils/utils');

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

    const userExists = await User.findOne({ where: { UId }, include: [UserPicture], });

    if (userExists) {
      return res.status(409).json({ status: false, message: 'User already exists' });
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

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path);
        await UserPicture.create({
          userId: user.id,
          imageUrl: uploadResult.secure_url,
        });

        console.log("Uploaded file to Cloudinary: ", uploadResult.secure_url);
      }
    }

    const token = generateToken(email);

    res.status(200).json({ status: true, message: 'User signed up successfully', "token": token });

  } catch (error) {
    res.status(500).json({ status: false, message: 'File uploading failed for user', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { uid } = req.query;

    if (uid) {
      const user = await User.findOne({
        where: { UId: uid },
        include: [UserPicture],
      });
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
      const users = await User.findAll({
        include: [UserPicture],
      });
      return res.status(200).json({
        status: true,
        message: 'All users fetched successfully',
        users,
      });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
  }
};
