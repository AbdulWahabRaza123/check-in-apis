const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/signup', upload.array('profilePicUrl', 4), userController.signUp);
router.post('/checkin', userController.saveUserCheckIn);

module.exports = router;
