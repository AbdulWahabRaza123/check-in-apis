// controllers/userController.js
const User = require('../models/User');
const UserCheckIn = require('../models/UserCheckIn');
const UserPicture = require('../models/UserPicture');
const Voucher = require('../models/Voucher');
const UserVoucher = require('../models/UserVoucher');
const PaymentHistory = require('../models/PaymentHistory');

const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { generateToken } = require('../utils/utils');
const { body, validationResult } = require('express-validator');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Route validation middleware
exports.validate = (method) => {
  switch (method) {
    case 'addVoucher': {
      return [
        body('name').notEmpty().withMessage('Name is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('expiryDays').isInt({ min: 1 }).withMessage('Expiry days must be a positive integer')
      ];
    }
    case 'addSubscription': {
      return [
        body('userId').notEmpty().withMessage('User ID is required'),
        body('voucherId').notEmpty().withMessage('Voucher ID is required')
      ];
    }
    case 'addPayment': {
      return [
        body('date').notEmpty().withMessage('Date is required'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
        body('reason').notEmpty().withMessage('Reason is required'),
        body('userId').notEmpty().withMessage('User ID is required'),
        body('voucherId').notEmpty().withMessage('Voucher ID is required')
      ];
    }
    case 'signUp': {
      return [
        body('UId').notEmpty().withMessage('User ID is required'),
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required')
      ];
    }
  }
};

exports.addVoucher = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errors.array() });
  }

  try {
    const { name, description, expiryDays } = req.body;

    const voucherExists = await Voucher.findOne({ where: { name } });

    if (voucherExists) {
      return res.status(409).json({ status: false, message: "Voucher already exists" });
    }

    const voucher = await Voucher.create({
      name,
      description,
      expiryTime: expiryDays,
    });

    return res.status(201).json({ status: true, message: "Voucher Created Successfully", voucher });
  } catch (error) {
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ status: false, message: 'Service Unavailable', error: error.message });
    }
    res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.addSubscription = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errors.array() });
  }

  try {
    const { userId, voucherId } = req.body;

    const userExists = await User.findOne({ where: { UId: userId } });
    const voucherExists = await Voucher.findOne({ where: { id: voucherId } });

    if (!voucherExists || !userExists) {
      return res.status(404).json({ status: false, message: 'User or Voucher does not exist' });
    }

    await userExists.update({ subscribed: true });
    const createdSubscription = await UserVoucher.create({
      userId: userExists.id,
      voucherId: voucherExists.id,
    });

    return res.status(201).json({ status: true, message: 'Successfully Subscribed', createdSubscription });
  } catch (error) {
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ status: false, message: 'Service Unavailable', error: error.message });
    }
    res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.addPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errors.array() });
  }

  try {
    const { date, amount, reason, userId, voucherId } = req.body;

    const userExists = await User.findOne({ where: { UId: userId } });
    const voucherExists = await Voucher.findOne({ where: { id: voucherId } });

    if (!voucherExists || !userExists) {
      return res.status(404).json({ status: false, message: 'User or Voucher does not exist' });
    }

    const payment = await PaymentHistory.create({
      date,
      reason,
      amount,
      userId: userExists.id,
      voucherId: voucherId
    });

    return res.status(201).json({ status: true, message: "Payment Added Successfully", payment });
  } catch (error) {
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ status: false, message: 'Service Unavailable', error: error.message });
    }
    res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errors.array() });
  }

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

    const userExists = await User.findOne({ where: { UId }, include: [UserPicture] });

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

    res.status(200).json({ status: true, message: 'User signed up successfully', token });

  } catch (error) {
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ status: false, message: 'Service Unavailable', error: error.message });
    }
    res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
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
        return res.status(404).json({
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
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ status: false, message: 'Service Unavailable', error: error.message });
    }
    res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
  }
};
