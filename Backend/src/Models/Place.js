const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    // 1. THÔNG TIN HIỂN THỊ (Use Case: Xem chi tiết)
    name: {
      type: String,
      required: [true, "Tên địa điểm là bắt buộc"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Mô tả không được để trống"],
    },
    address: {
      type: String,
      required: [true, "Địa chỉ là bắt buộc"],
    },
    images: [{ type: String }],
    category: {
      type: String,
      required: true,
      enum: [
        "Restaurant",
        "Hotel",
        "Attraction",
        "Beach",
        "Mountain",
        "Culture",
      ],
    },

    // 2. TỌA ĐỘ (Dùng cho Map & AI tính toán lộ trình)
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    // 3. GIÁ CẢ & DỊCH VỤ
    price: { type: Number, default: 0 },
    priceRange: {
      type: String,
      enum: ["Free", "Low", "Medium", "High"],
      default: "Medium",
    },
    openingHours: { type: String },

    // 4. HỆ THỐNG ĐÁNH GIÁ (Update tự động từ Review Controller)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    // 5. DỮ LIỆU ĐẶC BIỆT ĐỂ TRAIN AI (Vô cùng quan trọng)
    averageTimeSpent: {
      type: Number,
      default: 60, // Đơn vị: Phút. AI dùng để cộng dồn lịch trình.
      help: "Thời gian khách thường ở lại đây (ví dụ: 120 cho Bà Nà, 30 cho Cầu Rồng)",
    },
    tags: [
      {
        type: String,
        help: "Ví dụ: ['yên tĩnh', 'sống ảo', 'lịch sử', 'gia đình']",
      },
    ],
    suitableWeather: [
      {
        type: String,
        enum: ["Sunny", "Rainy", "All"],
        default: "All",
      },
    ],
    popularityScore: {
      type: Number,
      default: 0, // AI sẽ ưu tiên gợi ý nơi có score cao
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Place", placeSchema);
