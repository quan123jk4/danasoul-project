const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Sẽ băm bằng bcrypt
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: ["TOURIST", "BUSINESS", "ADMIN"],
      default: "TOURIST",
    },
    phone: { type: String },
    points: { type: Number, default: 0 }, // Điểm Gamification

    // Security
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    otpSecret: { type: String }, // Dành cho xác thực đa yếu tố (MFA) sau này
    isVerified: {
      type: Boolean,
      default: false, // Mới đăng ký thì mặc định là chưa xác thực
    },
    verificationCode: String, // Lưu mã OTP 6 số
    verificationCodeExpires: Date, // Thời gian hết hạn của mã OTP
  },

  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
