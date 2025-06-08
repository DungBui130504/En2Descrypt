const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Thông tin cá nhân',
        user: req.user, // Lấy từ middleware
    });
});

router.get('/check-login', authController.checkLogin);

router.post('/logout', authController.logout);

module.exports = router;