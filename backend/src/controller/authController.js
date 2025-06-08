const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../util/jwtUtil');
const UserModel = require("../model/userModel")

exports.register = async (req, res) => {
    try {
        const user = req.body;
        const users = await UserModel.createUser(user);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const user = req.body;

        const { Username, PasswordHash } = req.body;

        // console.log({ Username, PasswordHash });


        if (!Username.trim() || !PasswordHash.trim()) {
            return res.status(400).json({ message: 'Thiếu tên đăng nhập hoặc mật khẩu' });
        }

        const login = await UserModel.checkLogin(user);

        if (!login) {
            return res.status(401).json({ message: 'Không tìm thấy người dùng!' });
        }

        // console.log(login.UserID);

        const payload = { UserID: login.UserID, FullName: login.FullName }

        const accessToken = generateAccessToken(payload);

        // console.log(accessToken);

        res.cookie('atn', accessToken, {
            httpOnly: true, // Cookie không thể truy cập từ JavaScript phía client
            maxAge: 20 * 60 * 1000, // 20 phút
            sameSite: 'lax', // hoặc 'none' nếu dùng HTTPS
            secure: false // nếu đang test ở localhost. Đặt true nếu là HTTPS
        })
            
        res.json({ Username: login.FullName, accessToken });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Kiểm tra token (kiểm tra xem người dùng đã đăng nhập hay chưa)
exports.checkLogin = async (req, res) => {
    const token = req.cookies.atn;  // Lấy token từ cookie

    // console.log(token);

    if (!token) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    try {
        const decoded = await verifyAccessToken(token);
        res.json({ isAuthenticated: true, user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

// Tạo access token mới
exports.refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Không có refresh token' });

    try {
        const user = verifyRefreshToken(token);
        const newAccessToken = generateAccessToken({ id: user.id, username: user.username, role: user.role });
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ message: 'Refresh token không hợp lệ' });
    }
}

exports.logout = async (req, res) => {

    res.clearCookie('atn', {
        httpOnly: true,
        sameSite: 'Strict', // Thiết lập bảo mật
    });

    res.json({ message: 'Đăng xuất thành công' });
}