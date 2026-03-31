const jwt = require("jsonwebtoken");
const User = require("../Models/User");

//check xem user co dang nhap tai khoan khong
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};
//check xem user co phai la admin hay khong
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = roles.map((r) => r.toLowerCase());
    const userRole = req.user.role.toLowerCase().trim();
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Lỗi phân quyền: Quyền [${userRole}] không được phép thực hiện hành động này!`,
      });
    }
    next();
  };
};
