const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const venueController = require('../controllers/venueController');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Folder name in Cloudinary
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) => Date.now().toString() + '-' + file.originalname,
  },
});

// Configure multer with Cloudinary storage
const upload = multer({ storage: storage });

// Define routes
router.post('/create', upload.array('files', 4), venueController.createVenue);
router.get('/get-all/within-radius', venueController.getVenuesWithinRadiusAndCity);
router.get('/:venueId', venueController.getVenueById);

module.exports = router;
