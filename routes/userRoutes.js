const express = require('express');
const userController = require('../controllers/userController');
const {authenticateToken} = require('../middleware/verifyToken');

const router = express.Router();
const upload = require('../utils/storage');

router.post('/signup', upload.array('profilePicUrl', 4), userController.signUp);
router.get('/getUsers', authenticateToken, userController.getUsers);

module.exports = router;
