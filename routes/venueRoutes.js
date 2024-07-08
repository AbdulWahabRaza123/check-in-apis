// routes/venueRoutes.js
const express = require('express');
const venueController = require('../controllers/venueController');

const router = express.Router();

router.get('/getVenues', venueController.getVenues);
router.post('/checkin', venueController.checkInUser);
router.post('/createVenue', venueController.createVenue);
router.post('/checkout', venueController.checkOutUser);


module.exports = router;
