const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" }, // Của quán nào
    code: { type: String, required: true, unique: true },
    discountValue: { type: Number, required: true }, // Số tiền hoặc %
    requiredPoints: { type: Number, required: true }, // Cần bao nhiêu điểm để đổi
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Voucher", voucherSchema);
