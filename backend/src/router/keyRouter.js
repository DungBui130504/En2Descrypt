const express = require('express');
const router = express.Router();
const keyController = require("../controller/keyController");
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/keys', authenticateToken, keyController.getAllKeys);

router.post('/addKey', authenticateToken, keyController.addKey);

router.delete('/delKey/:keyId', authenticateToken, keyController.delKey);

module.exports = router;