const express = require('express');
const multer = require('multer');
const venueController = require('../controllers/venueController');

const router = express.Router();
const upload = require('../utils/storage');

router.post('/create', upload.array('files', 4), venueController.createVenue);
router.get('/get-all/within-radius', venueController.getVenuesWithinRadiusAndCity);
router.get('/:venueId', venueController.getVenueById);

module.exports = router;
