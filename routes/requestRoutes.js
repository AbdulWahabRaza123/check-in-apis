const express = require('express');
const requestController = require('../controllers/requestController');
const upload = require('../utils/storage');
const {authenticateToken} = require('../middleware/verifyToken');

const router = express.Router();

router.post('/sendRequest', upload.none(), authenticateToken, requestController.sendRequest);
router.get('/getRequests', authenticateToken,requestController.getRequests);

router.put('/acceptRequest', upload.none(), authenticateToken, requestController.acceptRequest);
router.put('/rejectRequest', upload.none(), authenticateToken, requestController.rejectRequest);

router.get('/getFriendList', authenticateToken, requestController.getFriendList);

module.exports = router;