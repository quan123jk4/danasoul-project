const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    partnerName: { type: String, required: true },
    pointsRequired: { type: Number, required: true },
    discountValue: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    quantity: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    expirationDate: { type: Date, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Ẩm thực", "Khách sạn", "Giải trí", "Di chuyển"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Voucher", voucherSchema);
