const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. CHỨC NĂNG ĐĂNG KÝ (REGISTER)
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // Băm (Hash) mật khẩu - Tăng độ bảo mật (chuẩn AES/Bcrypt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
      role: role || "TOURIST", // Mặc định là Tourist nếu không truyền
    });

    res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 2. CHỨC NĂNG ĐĂNG NHẬP (LOGIN)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    // Kiểm tra xem tài khoản có đang bị khóa (Brute Force) không
    if (user.isLocked) {
      return res.status(403).json({
        message:
          "Tài khoản đã bị khóa do nhập sai quá nhiều lần. Vui lòng liên hệ Admin!",
      });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Tăng số lần nhập sai lên 1
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true; // Khóa luôn nếu sai 5 lần
      }
      await user.save();

      return res.status(400).json({
        message: `Sai mật khẩu! Bạn đã nhập sai ${user.failedLoginAttempts}/5 lần.`,
      });
    }

    // Đăng nhập thành công -> Reset lại số lần nhập sai về 0
    user.failedLoginAttempts = 0;
    await user.save();

    // Tạo vé thông hành (Token JWT)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // Token sống được 1 ngày
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
