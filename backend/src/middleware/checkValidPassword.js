function checkPassword(req, res, next) {
    const password = req.body.password;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    // Kiểm tra điều kiện password
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    next();
}

module.exports = checkPassword;