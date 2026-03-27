const express = require("express");
const router = express.Router();
const realRouter = express.Router();
const authController = require("../controllers/authController");

realRouter.post("/register", authController.register);
realRouter.post("/login", authController.login);

module.exports = realRouter;
