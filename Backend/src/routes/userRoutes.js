const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
//admin
router.delete("/:id", protect, authorize("admin"), userController.deleteUser);
router.patch(
  "/:id/role",
  protect,
  authorize("admin"),
  userController.updateUserRole,
);
router.get("/", protect, authorize("ADMIN"), userController.getAllUsers);
module.exports = router;
