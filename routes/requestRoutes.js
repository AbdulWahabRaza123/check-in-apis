const express = require('express');
const requestController = require('../controllers/requestController');
const upload = require('../utils/storage');

const router = express.Router();

router.post('/sendRequest', upload.none(), requestController.sendRequest);
router.get('/getRequests', requestController.getRequests);

router.put('/acceptRequest', upload.none(), requestController.acceptRequest);
router.put('/rejectRequest', upload.none(), requestController.rejectRequest);

router.get('/getFriendList', requestController.getFriendList);

module.exports = router;