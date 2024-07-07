const express = require('express');
const venueController = require('../controllers/venueController');

const router = express.Router();
const upload = require('../utils/storage');

router.get('/getVenues', venueController.getVenues);
router.post('/checkin', venueController.checkInUser);
module.exports = router;
