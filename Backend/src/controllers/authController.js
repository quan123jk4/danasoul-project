const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Đăng kí
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set thời gian hết hạn là 10 phút tính từ hiện tại
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
      role: role || "TOURIST",
      verificationCode: otp,
      verificationCodeExpires: otpExpires,
    });

    // 4. Soạn nội dung và gửi Email
    const mailOptions = {
      from: `"DaNang Travel App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Xác thực tài khoản của bạn",
      html: `
        <h2>Chào ${fullName},</h2>
        <p>Cảm ơn bạn đã tham gia ứng dụng du lịch của chúng tôi.</p>
        <p>Mã xác thực (OTP) của bạn là: <b style="font-size: 24px; color: blue;">${otp}</b></p>
        <p>Mã này sẽ hết hạn sau 10 phút.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.",
      userId: newUser._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// XÁC THỰC EMAIL BẰNG MÃ OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Tài khoản này đã được xác thực rồi!" });
    }
    if (user.verificationCode !== otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác!" });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Mã OTP đã hết hạn! Vui lòng yêu cầu gửi lại." });
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    res.status(200).json({
      message: "Xác thực tài khoản thành công! Bạn có thể đăng nhập.",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }
    if (user.isLocked) {
      return res.status(403).json({
        message:
          "Tài khoản đã bị khóa do nhập sai quá nhiều lần. Vui lòng liên hệ Admin!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
      }
      await user.save();

      return res.status(400).json({
        message: `Sai mật khẩu! Bạn đã nhập sai ${user.failedLoginAttempts}/5 lần.`,
      });
    }

    user.failedLoginAttempts = 0;
    await user.save();

    // Tạo vé thông hành (Token JWT)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
