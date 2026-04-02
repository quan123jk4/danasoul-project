const express = require("express");
const router = express.Router();
const checkinController = require("../controllers/checkinController");
const { protect } = require("../middleware/authMiddleware");

// Chức năng này yêu cầu phải đăng nhập
router.post("/", protect, checkinController.createCheckIn);

module.exports = router;
