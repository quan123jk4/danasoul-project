const User = require("../Models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phoneNumber, avatar },
      { new: true, runValidators: true },
    ).select("-password");

    res.status(200).json({
      message: "Cập nhật hồ sơ thành công!",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
//Delete
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng!" });
    }
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể tự xóa tài khoản của chính mình!",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Đã xóa người dùng thành công!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
};
//thay đổi role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const upperRole = role.toUpperCase().trim();
    const allowedRoles = ["TOURIST", "BUSINESS", "ADMIN"];

    if (!allowedRoles.includes(upperRole)) {
      return res.status(400).json({
        success: false,
        message: `Role không hợp lệ! Vui lòng chọn 1 trong 3: ${allowedRoles.join(", ")}`,
      });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: upperRole },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng!" });
    }
    res.status(200).json({
      success: true,
      message: `Đã cấp quyền [${user.role}] cho người dùng thành công!`,
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};
