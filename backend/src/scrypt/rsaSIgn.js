const crypto = require('crypto');

function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // Độ dài khóa
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });

    return { publicKey, privateKey };
}

// Hàm ký message
function signMessage(message, privateKey) {
    return crypto.sign('sha1', Buffer.from(message), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    });
}

// Hàm xác minh chữ ký
function verifySignature(message, signatureBuffer, publicKey) {
    return crypto.verify('sha1', Buffer.from(message), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    }, signatureBuffer);
}

module.exports = {
    generateKeyPair,
    signMessage,
    verifySignature
};


