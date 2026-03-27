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
