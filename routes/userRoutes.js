const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();
const upload = require('../utils/storage');

router.post('/signup', upload.array('profilePicUrl', 4), userController.signUp);
router.get('/getUsers', userController.getUsers);

module.exports = router;
