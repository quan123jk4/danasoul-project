const Review = require("../Models/Review");
const Place = require("../Models/Place");

exports.createReview = async (req, res) => {
  try {
    const { placeId, rating, comment, media } = req.body;

    // 1. Lưu đánh giá mới
    const review = await Review.create({
      place: placeId,
      user: req.user.id,
      rating,
      comment,
      media,
    });

    // 2. LOGIC TỰ CẬP NHẬT RATING (Post-condition)
    const allReviews = await Review.find({ place: placeId });
    const avgRating =
      allReviews.reduce((acc, item) => item.rating + acc, 0) /
      allReviews.length;

    await Place.findByIdAndUpdate(placeId, { rating: avgRating.toFixed(1) });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ message: "Lỗi gửi đánh giá", error: error.message });
  }
};

// Logic tương tác: Nhấn "Hữu ích"
exports.toggleHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review.helpfulUps.includes(req.user.id)) {
      review.helpfulUps.push(req.user.id);
    } else {
      review.helpfulUps.pull(req.user.id); // Nhấn lần nữa thì bỏ thích
    }
    await review.save();
    res.status(200).json({ success: true, count: review.helpfulUps.length });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
