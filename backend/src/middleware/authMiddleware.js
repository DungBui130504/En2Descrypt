const { verifyAccessToken } = require('../util/jwtUtil');

function authenticateToken(req, res, next) {
    const token = req.cookies.atn;

    if (!token) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded; // Lưu thông tin user vào request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}

function optinalAuthenticateToken(req, res, next) {
    const token = req.cookies.atn;

    if (!token) {
        return next();
    }
    else {
        try {
            const decoded = verifyAccessToken(token);
            req.user = decoded; // Lưu thông tin user vào request
            next();
        } catch (err) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
    }
}

module.exports = { authenticateToken, optinalAuthenticateToken };
