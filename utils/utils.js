const cloudinary = require('../config/cloudinaryConfig');
const jwt = require("jsonwebtoken");

// Helper function to upload files to Cloudinary
const uploadToCloudinary = (file, folder) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: folder }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }).end(file.buffer);
    });
};

const generateToken = (email) => {
    return jwt.sign({email}, process.env.JWT_SECRET);
}

module.exports = { uploadToCloudinary, generateToken };
