// routes/venueRoutes.js
const express = require("express");
const venueController = require("../controllers/venueController");

const { authenticateToken } = require("../middleware/verifyToken");
const router = express.Router();

router.get("/getVenues", venueController.getVenues);
router.post("/checkin", authenticateToken, venueController.checkInUser);
router.post("/createVenue", venueController.createVenue);
router.post("/checkout", authenticateToken, venueController.checkOutUser);

module.exports = router;
