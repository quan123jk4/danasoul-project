const Place = require("../Models/Place");
const Review = require("../Models/Review");

// 1. [POST] Tạo địa điểm mới (Dành cho Admin/Chủ tịch test dữ liệu)
exports.createPlace = async (req, res) => {
  try {
    const newPlace = await Place.create(req.body);
    res.status(201).json({
      success: true,
      data: newPlace,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Không thể tạo địa điểm. Có thể tên đã tồn tại!",
      error: error.message,
    });
  }
};

// 2. [GET] Lấy danh sách địa điểm (Có lọc theo Category - Rất quan trọng cho AI)
exports.getAllPlaces = async (req, res) => {
  try {
    // Nếu có query ?category=Restaurant thì lọc, không thì lấy hết
    const filter = req.query.category ? { category: req.query.category } : {};

    const places = await Place.find(filter);

    res.status(200).json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. [GET] Xem chi tiết địa điểm (Main Flow: Tên, Ảnh, Giá, Review)
exports.getPlaceDetail = async (req, res) => {
  try {
    // Tìm địa điểm
    const place = await Place.findById(req.params.id);

    // Alternative Flow: Không tìm thấy
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm này trong hệ thống!",
      });
    }

    // Lấy danh sách Review liên quan (Post-condition)
    const reviews = await Review.find({ place: req.params.id })
      .populate("user", "fullName avatar") // Lấy tên người dùng cho đẹp
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      data: {
        ...place._doc,
        reviews: reviews, // Gộp review vào thông tin địa điểm
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "ID không hợp lệ hoặc lỗi server" });
  }
};
