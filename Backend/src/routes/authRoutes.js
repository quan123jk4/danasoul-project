const express = require("express");
const realRouter = express.Router();
const authController = require("../controllers/authController");

realRouter.post("/register", authController.register);
realRouter.post("/login", authController.login);
realRouter.post("/verify-email", authController.verifyEmail);

module.exports = realRouter;
