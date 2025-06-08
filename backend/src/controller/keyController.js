const keyModel = require('../model/keyModel');

exports.getAllKeys = async (req, res) => {
    try {
        const userId = req.user.UserID;
        // console.log(userId);
        const keys = await keyModel.getAllKeys(userId);
        res.json(keys);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.addKey = async (req, res) => {
    try {
        const userId = req.user.UserID;
        const { publicKey, privateKey } = req.body;
        const keys = await keyModel.createKey({ userId: userId, publicKey: JSON.stringify(publicKey), privateKey: JSON.stringify(privateKey) });
        res.json(keys);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.delKey = async (req, res) => {
    try {
        const userId = req.user.UserID;
        const keyId = req.params.keyId;
        // console.log(userId);
        // console.log(keyId);

        const key = await keyModel.deleteKey(keyId, userId);
        res.json(key);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}