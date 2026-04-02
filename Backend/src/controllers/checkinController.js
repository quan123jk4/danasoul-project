const CheckIn = require("../Models/CheckIn");
const Place = require("../Models/Place");
const User = require("../Models/User");

// Hàm tính khoảng cách giữa 2 tọa độ GPS (Công thức Haversine) - Trả về đơn vị: Mét
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Bán kính Trái Đất (mét)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// [POST] Xử lý Check-in
exports.createCheckIn = async (req, res) => {
  try {
    const { placeId, userLat, userLng, caption, media } = req.body;
    const userId = req.user.id;

    // 1. Tìm địa điểm để lấy tọa độ gốc
    const place = await Place.findById(placeId);
    if (!place) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy địa điểm" });
    }

    // LỚP BẢO VỆ: Kiểm tra xem Database đã có cấu trúc GeoJSON chưa
    if (
      !place.location ||
      !place.location.coordinates ||
      place.location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Lỗi hệ thống: Địa điểm này chưa được cài đặt tọa độ gốc (GPS) trong Database!",
      });
    }

    // LẤY TỌA ĐỘ TỪ MẢNG GEOJSON (Lưu ý: Kinh độ index 0, Vĩ độ index 1)
    const placeLng = place.location.coordinates[0];
    const placeLat = place.location.coordinates[1];

    // 2. Kiểm tra khoảng cách
    const distance = getDistance(userLat, userLng, placeLat, placeLng);

    // BẢO MẬT: Chặn khoảng cách > 150m và chặn luôn lỗi NaN
    if (isNaN(distance) || distance > 150) {
      return res.status(400).json({
        success: false,
        message: `Bạn chưa đến đúng địa điểm! Khoảng cách hiện tại là ${Math.round(distance || 0)}m. Vui lòng di chuyển lại gần hơn (dưới 150m).`,
        currentDistance: Math.round(distance || 0),
      });
    }

    // 3. Kiểm tra giới hạn thời gian (Rules: 1 lần/tuần/1 địa điểm)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existingCheckIn = await CheckIn.findOne({
      userId: userId,
      placeId: placeId,
      createdAt: { $gte: sevenDaysAgo },
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message:
          "Bạn đã check-in tại địa điểm này trong tuần qua rồi! Hãy quay lại vào tuần sau nhé.",
      });
    }

    // 4. Tính toán điểm thưởng (Gamification)
    let points = 10; // Điểm cơ bản
    if (caption || (media && media.length > 0)) {
      points += 20; // Bonus
    }

    // 5. Lưu lịch sử Check-in (Đúng tên trường Database của bạn)
    const newCheckIn = await CheckIn.create({
      userId: userId,
      placeId: placeId,
      userLocation: { lat: userLat, lng: userLng },
      caption,
      media,
      earnedPoints: points,
    });

    // 6. Cộng điểm vào tài khoản User
    await User.findByIdAndUpdate(userId, {
      $inc: { points: points },
    });

    res.status(201).json({
      success: true,
      message: `Check-in thành công! Bạn nhận được ${points} điểm thưởng.`,
      data: newCheckIn,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
};
