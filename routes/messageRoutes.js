const express = require('express');

const messageController = require('../controllers/messageController');
const upload = require('../utils/storage');

const router = express.Router();

const {authenticateToken} = require('../middleware/verifyToken');

router.post('/send-message', upload.none(), authenticateToken, messageController.sendmessage);
router.get('/get-messages', authenticateToken, messageController.getMessages);
router.get('/getRecentMessages', authenticateToken, messageController.getRecentMessages);

module.exports = router;