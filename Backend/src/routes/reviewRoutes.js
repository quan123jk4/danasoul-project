const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Chỉ người đã đăng nhập mới được review (Pre-condition)
router.post("/", protect, reviewController.createReview);
// Tương tác hữu ích
router.patch("/:id/helpful", protect, reviewController.toggleHelpful);

router.put("/:id", protect, reviewController.updateReview);

// Xóa review (cần truyền ID của review vào URL)
router.delete("/:id", protect, reviewController.deleteReview);

module.exports = router;
