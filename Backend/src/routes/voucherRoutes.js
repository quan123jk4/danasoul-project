const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Link API: http://localhost:5000/api/v1/vouchers/admin/create
router.post(
  "/admin/create",
  protect,
  authorize("ADMIN"),
  voucherController.createVoucher,
);
router.get(
  "/admin/list",
  protect,
  authorize("ADMIN"),
  voucherController.getAdminVouchers,
);
// Link API: http://localhost:5000/api/v1/vouchers/redeem
router.post("/redeem", protect, voucherController.redeemVoucher);
router.get("/list", voucherController.getAllVouchers);
router.get("/my-redemptions", protect, voucherController.getMyRedemptions);

module.exports = router;
