const Place = require("../Models/Place");
const Review = require("../Models/Review");
const { escapeRegex, removeVietnameseTones } = require("../utils/searchHelper");

// 1. [POST] Tạo địa điểm mới
exports.createPlace = async (req, res) => {
  try {
    const data = req.body;

    // 1. LỚP BẢO VỆ SỐ 1: Kiểm tra xem có cấu trúc location chuẩn GeoJSON chưa
    if (
      !data.location ||
      data.location.type !== "Point" ||
      !data.location.coordinates ||
      !Array.isArray(data.location.coordinates) ||
      data.location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lỗi tạo địa điểm: Bắt buộc phải cung cấp location theo chuẩn GeoJSON với coordinates là mảng [Kinh độ, Vĩ độ]!",
      });
    }
    const [lng, lat] = data.location.coordinates;
    if (typeof lng !== "number" || typeof lat !== "number") {
      return res.status(400).json({
        success: false,
        message: "Lỗi dữ liệu: Kinh độ và Vĩ độ phải là định dạng số!",
      });
    }
    const newPlace = await Place.create(data);

    res.status(201).json({
      success: true,
      message: "Tạo địa điểm thành công!",
      data: newPlace,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. [GET] Lấy danh sách địa điểm (Xử lý Search, Filter, Vị trí & Alternative Flow)
exports.getAllPlaces = async (req, res) => {
  try {
    const { keyword, category, lat, lng } = req.query;
    let query = {};
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }
    if (category) {
      query.category = category;
    }

    let userLat = parseFloat(lat);
    let userLng = parseFloat(lng);
    let isDefaultLocation = false;

    // Alternative Flow: Mất định vị -> Lấy tọa độ Cầu Rồng (Đà Nẵng) làm tâm
    if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
      userLat = 16.0614;
      userLng = 108.2272;
      isDefaultLocation = true;
    }
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [userLng, userLat],
        },
        $maxDistance: 20000,
      },
    };
    let places = await Place.find(query)
      .sort({ hasSpecialEvent: -1, rating: -1 })
      .limit(20);
    if (places.length === 0) {
      const suggestions = await Place.find({ rating: { $gte: 4 } })
        .sort({ rating: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        message: "Không tìm thấy kết quả phù hợp. Gợi ý các địa điểm nổi bật:",
        isDefaultLocation, // FE dùng biến này để nhắc User bật GPS
        data: suggestions,
      });
    }
    res.status(200).json({
      success: true,
      count: places.length,
      isDefaultLocation,
      data: places,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. [GET] Xem chi tiết địa điểm (Post-condition: Rẽ nhánh Free / Có phí)
exports.getPlaceDetail = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin địa điểm",
      });
    }

    // Khởi tạo Object chứa dữ liệu cơ bản
    let responseData = {
      _id: place._id,
      name: place.name,
      images: place.images,
      rating: place.rating,
      description: place.description,
      location: place.location.coordinates,
      address: place.address,
      category: place.category,
      hasSpecialEvent: place.hasSpecialEvent,
    };

    // Post-condition: Rẽ nhánh theo Business Rule
    if (place.priceRange === "Free") {
      // Đối với địa điểm Miễn phí (Văn hóa, Di tích)
      responseData.historyInfo =
        place.historyInfo || "Đang cập nhật lịch sử hình thành...";
    } else {
      // Đối với Dịch vụ (Quán ăn, Khách sạn)
      responseData.price = place.price;
      responseData.priceRange = place.priceRange;
      responseData.highlights = place.highlights || [];

      // Kéo thêm 5 Review mới nhất để chứng minh chất lượng dịch vụ
      const reviews = await Review.find({ place: place._id })
        .limit(5)
        .populate("user", "fullName avatar")
        .sort("-createdAt");

      responseData.recentReviews = reviews;
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// [GET] Tìm kiếm địa điểm (Không yêu cầu đăng nhập)
exports.searchPlaces = async (req, res) => {
  try {
    const { keyword, category, priceRange } = req.query;
    let query = {};
    if (keyword) {
      const safeKeyword = escapeRegex(keyword);

      const noAccentKeyword = removeVietnameseTones(safeKeyword);
      query.$or = [
        { name: { $regex: safeKeyword, $options: "i" } },
        { description: { $regex: safeKeyword, $options: "i" } },
        { searchString: { $regex: noAccentKeyword, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (priceRange) query.priceRange = priceRange;
    let places = await Place.find(query)
      .select("name images category priceRange rating address popularityScore") // Tối ưu tốc độ tải
      .sort({ popularityScore: -1, rating: -1 }) // Ưu tiên nơi nổi bật lên đầu
      .limit(20);

    if (places.length === 0) {
      const suggestions = await Place.find({ rating: { $gte: 4 } })
        .select("name images category priceRange rating address")
        .sort({ popularityScore: -1, rating: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        message:
          "Không tìm thấy kết quả phù hợp. Dưới đây là các địa điểm nổi bật gợi ý cho bạn:",
        isAlternative: true,
        data: suggestions,
      });
    }
    res.status(200).json({
      success: true,
      count: places.length,
      isAlternative: false,
      data: places,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
};
