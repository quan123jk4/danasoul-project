const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    images: [{ type: String }], // Link ảnh review
    isFlagged: { type: Boolean, default: false }, // Đánh dấu nếu có dấu hiệu buff bẩn
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
