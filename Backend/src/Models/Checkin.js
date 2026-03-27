const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema(
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
    earnedPoints: { type: Number, required: true },
    gpsValidation: { type: Boolean, default: true }, // Xác nhận vị trí khách có thực sự ở quán không
  },
  { timestamps: true },
);

module.exports = mongoose.model("CheckIn", checkInSchema);
