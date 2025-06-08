const jwt = require('jsonwebtoken');
const secret_access_token_key = process.env.secret_access_token_key;
const secret_refresh_token_key = process.env.secret_refresh_token_key;

// Tao access token
function generateAccessToken(payload) {
    return jwt.sign(payload, secret_access_token_key, { expiresIn: '15m' });
}

// Kiem tra access token
function verifyAccessToken(token) {
    return jwt.verify(token, secret_access_token_key);
}

// Tao refresh token
function generateRefreshToken(payload) {
    return jwt.sign(payload, secret_refresh_token_key, { expiresIn: '7d' });
}

// Kiem tra refresh token
function verifyRefreshToken(token) {
    return jwt.verify(token, secret_refresh_token_key);
}
module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};