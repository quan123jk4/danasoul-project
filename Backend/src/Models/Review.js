const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    media: [{ type: String }], // Lưu mảng link ảnh/video (Rule quan trọng nhất)
    helpfulUps: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người nhấn Hữu ích
    isApproved: { type: Boolean, default: false },
    adminReply: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
