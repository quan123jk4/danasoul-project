const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    category: { type: String, required: true }, // VD: 'Food', 'Hotel', 'Culture'
    minPrice: { type: Number, default: 0 },
    maxPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    // Dữ liệu cho AI
    tags: [{ type: String }],
    openingHours: { type: String }, // VD: "08:00-22:00"

    // Bảo tàng số 3D
    culturalTimeline: [
      {
        year: Number,
        title: String,
        description: String,
        mediaUrl: String,
      },
    ],

    isApproved: { type: Boolean, default: false }, // Admin duyệt
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Chủ doanh nghiệp
  },
  { timestamps: true },
);

module.exports = mongoose.model("Place", placeSchema);
