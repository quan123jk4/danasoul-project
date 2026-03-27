const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: ["TOURIST", "BUSINESS", "ADMIN"],
      default: "TOURIST",
    },
    phone: { type: String },
    points: { type: Number, default: 0 },
    // Security
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    otpSecret: { type: String }, // Dành cho xác thực đa yếu tố (MFA) sau này
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String, // Lưu mã OTP 6 số
    verificationCodeExpires: Date,
    phoneNumber: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
