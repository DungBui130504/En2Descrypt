const express = require('express');
const api = express.Router();
const authRouter = require('../router/authRouter.js');
const userRouter = require("../router/userRouter.js");
const keyRouter = require("../router/keyRouter.js");

api.get('/', (req, res) => {
    const forwardedIp = req.headers['x-forwarded-for'] || req.ip
    res.status(200).json(
        {
            message: "your ip address : " + forwardedIp
        }
    )
});

api.get("/ping", (req, res) => {
    res.status(200).json({
        message: "ok from backend!"
    });
})

api.use("/auth", authRouter);

api.use("/user", userRouter);

api.use("/key", keyRouter);

module.exports = api;