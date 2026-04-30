const Voucher = require("../Models/Voucher");
const VoucherRedemption = require("../Models/VoucherRedemption");
const User = require("../Models/User");

// [POST] User đổi điểm lấy mã Voucher
// [POST] User đổi điểm lấy mã Voucher
exports.redeemVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body;
    const userId = req.user.id;

    // 1. Kiểm tra voucher có tồn tại không
    const voucher = await Voucher.findById(voucherId);
    if (!voucher || !voucher.isActive) {
      return res.status(404).json({
        success: false,
        message: "Voucher không tồn tại hoặc đã hết hạn!",
      });
    }

    // --- ĐOẠN FIX LỖI: KIỂM TRA XEM USER ĐÃ ĐỔI NHƯNG CHƯA DÙNG CHƯA ---
    const existingRedemption = await VoucherRedemption.findOne({
      user: userId,
      voucher: voucherId,
      status: "Unused", // Nếu còn 1 mã chưa dùng thì không cho đổi tiếp cái cùng loại
    });

    if (existingRedemption) {
      return res.status(400).json({
        success: false,
        message:
          "Bạn đã sở hữu Voucher này và chưa sử dụng. Hãy dùng mã cũ trước khi đổi mới nhé!",
      });
    }
    // -------------------------------------------------------------

    // 2. Kiểm tra điểm user
    const user = await User.findById(userId);
    if (user.points < voucher.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: `Bạn không đủ điểm! Cần ${voucher.pointsRequired} điểm.`,
      });
    }

    // 3. Khấu trừ điểm
    user.points -= voucher.pointsRequired;
    await user.save();

    // 4. Sinh mã code và tạo bản ghi đổi thưởng
    const code =
      "DN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRedemption = await VoucherRedemption.create({
      user: userId,
      voucher: voucherId,
      code: code,
      status: "Unused",
    });

    res.status(200).json({
      success: true,
      message: "Đổi Voucher thành công!",
      data: {
        code: newRedemption.code,
        pointsRemaining: user.points,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const newVoucher = await Voucher.create(req.body);
    res.status(201).json({ success: true, data: newVoucher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// [GET] Lấy danh sách tất cả Voucher đang hoạt động
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ isActive: true }).sort({
      pointsRequired: 1,
    });
    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server", error: error.message });
  }
};
exports.getAdminVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server", error: error.message });
  }
};

// [GET] Lấy lịch sử đổi Voucher của User hiện tại (My Rewards)
exports.getMyRedemptions = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ authMiddleware (protect)

    // Dùng .populate('voucher') để lấy luôn thông tin title, partnerName từ bảng Voucher
    const redemptions = await VoucherRedemption.find({ user: userId })
      .populate("voucher", "title partnerName discountValue")
      .sort({ createdAt: -1 }); // Mới đổi hiện lên đầu

    res.status(200).json({
      success: true,
      data: redemptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy lịch sử đổi quà",
      error: error.message,
    });
  }
};
