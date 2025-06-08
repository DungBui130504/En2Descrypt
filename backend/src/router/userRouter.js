const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/users', userController.getAllUsers);

module.exports = router;