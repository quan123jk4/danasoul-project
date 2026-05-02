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
        message: "Voucher không tồn tại hoặc đã bị tắt!",
      });
    }

    // 2. Kiểm tra xem Voucher đã hết lượt đổi chưa
    const used = voucher.usedCount || 0;
    if (voucher.quantity && used >= voucher.quantity) {
      return res.status(400).json({
        success: false,
        message: "Rất tiếc, Voucher này đã hết lượt đổi!",
      });
    }

    // 3. Kiểm tra xem user đã sở hữu và chưa dùng không
    const existingRedemption = await VoucherRedemption.findOne({
      user: userId,
      voucher: voucherId,
      status: "Unused",
    });

    if (existingRedemption) {
      return res.status(400).json({
        success: false,
        message:
          "Bạn đã sở hữu Voucher này và chưa sử dụng. Hãy dùng mã cũ trước khi đổi mới nhé!",
      });
    }

    // 4. Kiểm tra điểm user
    const user = await User.findById(userId);
    if (user.points < voucher.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: `Bạn không đủ điểm! Cần ${voucher.pointsRequired} điểm.`,
      });
    }

    // 5. TẠO BẢN GHI ĐỔI THƯỞNG TRƯỚC (Trộn mã Admin + Mã Random)
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();
    const uniqueCode = `${voucher.code}-${randomSuffix}`; // VD: CGV50K-A8F9

    const newRedemption = new VoucherRedemption({
      user: userId,
      voucher: voucherId,
      code: uniqueCode,
      status: "Unused",
    });

    // Lưu Voucher vào túi người dùng trước!
    await newRedemption.save();

    // 6. Sau khi chắc chắn có Voucher, tiến hành trừ điểm và tăng lượt dùng
    user.points -= voucher.pointsRequired;
    await user.save();

    voucher.usedCount = used + 1;
    await voucher.save();

    // 7. Trả kết quả về Frontend
    res.status(200).json({
      success: true,
      message: "Đổi Voucher thành công!",
      data: {
        code: newRedemption.code,
        pointsRemaining: user.points,
        title: voucher.title,
      },
    });
  } catch (error) {
    console.error("LỖI CRASH HỆ THỐNG KHI ĐỔI VOUCHER:", error);
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
exports.deleteVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;

    // Tìm và xóa voucher trong Database
    const voucher = await Voucher.findByIdAndDelete(voucherId);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy Voucher này để xóa!",
      });
    }

    // Tùy chọn nâng cao: Nếu muốn, ông có thể viết thêm code xóa luôn cả các
    // VoucherRedemption (lịch sử đổi quà) liên quan đến voucher này ở đây.
    // Nhưng tạm thời cứ xóa cái vỏ Voucher đi là OK rồi.

    res.status(200).json({
      success: true,
      message: "Đã xóa Voucher thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi Server khi xóa Voucher",
      error: error.message,
    });
  }
};
