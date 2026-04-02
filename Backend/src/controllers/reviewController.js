const Review = require("../Models/Review");
const Place = require("../Models/Place");

// [POST] Tạo đánh giá mới
exports.createReview = async (req, res) => {
  try {
    const { placeId, rating, comment, media } = req.body;
    const review = await Review.create({
      place: placeId,
      user: req.user.id,
      rating,
      comment,
      media,
    });
    const allReviews = await Review.find({ place: placeId });
    const avgRating =
      allReviews.reduce((acc, item) => item.rating + acc, 0) /
      allReviews.length;

    await Place.findByIdAndUpdate(placeId, {
      rating: avgRating.toFixed(1),
      numReviews: allReviews.length,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ message: "Lỗi gửi đánh giá", error: error.message });
  }
};

// [PATCH] Nhấn "Hữu ích"
exports.toggleHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review.helpfulUps.includes(req.user.id)) {
      review.helpfulUps.push(req.user.id);
    } else {
      review.helpfulUps.pull(req.user.id);
    }
    await review.save();
    res.status(200).json({ success: true, count: review.helpfulUps.length });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
// [PUT] Chỉnh sửa đánh giá
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, media } = req.body;
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đánh giá!" });
    }
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa đánh giá này!",
      });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (media) review.media = media;

    await review.save();
    if (rating) {
      const allReviews = await Review.find({ place: review.place });
      const avgRating =
        allReviews.reduce((acc, item) => item.rating + acc, 0) /
        allReviews.length;
      await Place.findByIdAndUpdate(review.place, {
        rating: avgRating.toFixed(1),
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Cập nhật thành công", data: review });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
};

// [DELETE] Xóa đánh giá
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đánh giá!" });
    }
    if (review.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này!",
      });
    }

    const placeId = review.place;

    await review.deleteOne();
    const allReviews = await Review.find({ place: placeId });
    let avgRating = 0;
    if (allReviews.length > 0) {
      avgRating =
        allReviews.reduce((acc, item) => item.rating + acc, 0) /
        allReviews.length;
    }

    await Place.findByIdAndUpdate(placeId, {
      rating: avgRating.toFixed(1),
      numReviews: allReviews.length,
    });

    res
      .status(200)
      .json({ success: true, message: "Đã xóa đánh giá thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
};
