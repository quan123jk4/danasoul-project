import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faCamera,
  faTrophy,
  faArrowRight,
  faArrowDown,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const DA_NANG_CENTER = [16.0544, 108.2022];

// ==========================================
// CÔNG TẮC BẢO BỐI CHO LÚC ĐI THI (DEMO)
// Đổi thành false nếu muốn quét GPS thật trên điện thoại
// ==========================================
const IS_DEMO_MODE = true;

const trendingPlaces = [
  {
    id: 1,
    title: "Chùa Linh Ứng",
    location: "Sơn Trà, Đà Nẵng",
    tag: "VĂN HÓA",
    image:
      "https://images.unsplash.com/photo-1678184518712-421b4a0350d7?q=80&w=500",
    checkins: "2.4K",
    points: 50,
  },
  {
    id: 2,
    title: "Bảo tàng Chăm",
    location: "Quận Hải Châu",
    tag: "DI SẢN",
    image:
      "https://images.unsplash.com/photo-1596402181057-798888b14a93?q=80&w=500",
    checkins: "1.1K",
    points: 50,
  },
  {
    id: 3,
    title: "Ngũ Hành Sơn",
    location: "Quận Ngũ Hành Sơn",
    tag: "THIÊN NHIÊN",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=500",
    checkins: "3.8K",
    points: 50,
  },
];

const CheckinPage = () => {
  const [placesList, setPlacesList] = useState([]);
  const [userPoints, setUserPoints] = useState(0);

  const [formData, setFormData] = useState({
    placeId: "",
    caption: "",
    rating: 5,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-out-cubic" });

    const fetchPlaces = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/v1/places?limit=all",
        );
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setPlacesList(data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách địa điểm:", error);
      }
    };

    const fetchUserPoints = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(
            "http://localhost:5000/api/v1/users/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await res.json();
          if (data.success) setUserPoints(data.data.points || 0);
        } catch (error) {
          console.error("Lỗi lấy thông tin user:", error);
        }
      }
    };

    fetchPlaces();
    fetchUserPoints();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setStatus({ type: "error", message: "Ảnh phải < 10MB!" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setStatus({ type: "", message: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // HÀM XỬ LÝ CHÍNH: CHECK-IN VÀ REVIEW CÙNG LÚC
  // ==========================================
  const processCheckinRequest = async (token, lat, lng) => {
    try {
      // BƯỚC 1: GỌI API CHECK-IN
      const checkinResponse = await fetch(
        "http://localhost:5000/api/v1/checkin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            placeId: formData.placeId,
            userLat: lat,
            userLng: lng,
            caption: formData.caption,
            rating: formData.rating,
            media: previewImage ? [previewImage] : [],
          }),
        },
      );

      const checkinResult = await checkinResponse.json();

      if (checkinResponse.ok && checkinResult.success) {
        let reviewAdded = false;
        if (formData.caption && formData.caption.trim() !== "") {
          try {
            const reviewResponse = await fetch(
              "http://localhost:5000/api/v1/reviews",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  placeId: formData.placeId,
                  rating: formData.rating,
                  comment: formData.caption, // Backend của ông yêu cầu key là 'comment'
                  media: previewImage ? [previewImage] : [],
                }),
              },
            );
            if (reviewResponse.ok) {
              reviewAdded = true;
            } else {
              console.error("Tạo Review thất bại (Nhưng check-in vẫn OK)");
            }
          } catch (err) {
            console.error("Lỗi khi gọi API tạo Review:", err);
          }
        }

        // BƯỚC 3: CẬP NHẬT GIAO DIỆN
        const successMsg = reviewAdded
          ? "Check-in thành công & Đã đăng bài đánh giá!"
          : checkinResult.message || "Check-in thành công!";

        setStatus({ type: "success", message: successMsg });
        setFormData({ ...formData, caption: "", rating: 5 });
        setPreviewImage(null);

        // Cộng điểm UI giả lập
        let earned = 10;
        if (formData.caption && previewImage && formData.rating) earned += 40;
        else if (formData.caption || previewImage || formData.rating)
          earned += 10;

        setUserPoints((prev) => prev + earned);
      } else {
        setStatus({
          type: "error",
          message: checkinResult.message || "Check-in thất bại!",
        });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Lỗi kết nối máy chủ!" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.placeId) {
      setStatus({ type: "error", message: "Vui lòng chọn một địa điểm!" });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "info", message: "Đang xác thực dữ liệu..." });

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus({ type: "error", message: "Vui lòng đăng nhập để Check-in!" });
      setIsLoading(false);
      return;
    }

    if (IS_DEMO_MODE) {
      processCheckinRequest(token, 16.0611, 108.2278);
    } else {
      if (!navigator.geolocation) {
        setStatus({ type: "error", message: "Trình duyệt không hỗ trợ GPS!" });
        setIsLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          processCheckinRequest(
            token,
            position.coords.latitude,
            position.coords.longitude,
          ),
        (error) => {
          setIsLoading(false);
          setStatus({
            type: "error",
            message: "Vui lòng bật GPS để Check-in!",
          });
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  };

  return (
    <div className="bg-[#E5EDF4] min-h-screen w-full flex flex-col items-center relative pb-0 overflow-hidden">
      <div className="w-full max-w-[1280px] bg-white shadow-2xl rounded-none flex flex-col min-h-screen">
        <Navbar />

        <div
          className="w-full px-6 py-16 flex flex-col items-center text-center bg-[#F8FAFC]"
          data-aos="fade-up"
        >
          <span className="bg-[#E8F0FE] text-[#002045] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-6">
            Trải nghiệm di sản
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            <span className="text-[#002045]">Check-in ngay - </span>
            <span className="text-[#C4391D]">Tích điểm liền tay</span>
          </h1>
          <p className="text-slate-500 max-w-2xl text-sm leading-relaxed mb-8">
            Hệ thống sẽ quét GPS trong bán kính 150m để xác thực vị trí của bạn.
          </p>
        </div>

        <div className="w-full px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 overflow-hidden">
          {/* MAP */}
          <div
            className="relative w-full h-[650px] bg-[#E5EDF4] rounded-[2rem] overflow-hidden shadow-inner flex flex-col"
            data-aos="fade-right"
          >
            <div className="absolute inset-0 z-0">
              <MapContainer
                center={DA_NANG_CENTER}
                zoom={12}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[16.0611, 108.2278]}>
                  <Popup>
                    <b>Cầu Rồng</b>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#002045]/95 backdrop-blur-md w-[90%] max-w-[400px] p-4 rounded-2xl shadow-2xl flex items-center justify-between z-30">
              <div className="flex items-center gap-4 border-r border-white/20 pr-4">
                <FontAwesomeIcon
                  icon={faTrophy}
                  className="text-[#C4391D] text-3xl"
                />
                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">
                    Điểm của bạn
                  </p>
                  <p className="text-white text-2xl font-bold">
                    {userPoints.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex-1 pl-4 pr-2">
                <p className="text-white/80 text-[10px] leading-tight mb-2">
                  Hãy tích lũy thêm điểm để đổi Voucher
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div
            className="w-full bg-white rounded-[2rem] shadow-lg border border-slate-100 p-8 md:p-10 flex flex-col justify-center"
            data-aos="fade-left"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-50 text-[#C4391D] rounded-full flex items-center justify-center text-xl">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className={isLoading ? "animate-bounce" : ""}
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#002045]">
                  Check-in Ngay
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Chia sẻ trải nghiệm của bạn
                </p>
              </div>
            </div>

            {status.message && (
              <div
                className={`mb-6 p-4 text-sm font-bold rounded-xl border ${status.type === "success" ? "bg-green-50 text-green-700 border-green-200" : status.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div ref={dropdownRef} className="relative z-40">
                <label className="block text-xs font-bold text-[#002045] mb-2">
                  Chọn địa điểm
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onClick={() => {
                    // BÍ QUYẾT LÀ ĐÂY: Xóa chữ đang có khi click vào để show TẤT CẢ danh sách
                    setSearchTerm("");
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Đang tải danh sách..."
                  className="w-full bg-[#E5EDF4]/50 border border-transparent text-[#002045] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium cursor-text"
                />
                {isDropdownOpen && placesList.length > 0 && (
                  <ul className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50">
                    {placesList
                      .filter((p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((place) => (
                        <li
                          key={place._id}
                          onClick={() => {
                            setFormData({ ...formData, placeId: place._id });
                            setSearchTerm(place.name);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${formData.placeId === place._id ? "text-blue-700 font-bold bg-blue-50/50" : "text-slate-600"}`}
                        >
                          {place.name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002045] mb-2">
                  Tải ảnh lên
                </label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-[#E5EDF4]/30 hover:bg-[#E5EDF4]/60 transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faCamera}
                        className="text-slate-400 text-2xl mb-2"
                      />
                      <p className="text-slate-500 text-xs font-medium">
                        Nhấn để chọn ảnh hoặc kéo thả
                      </p>
                      <p className="text-slate-400 text-[10px] mt-1">
                        JPG, PNG lên tới 10MB
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002045] mb-2">
                  Cảm nghĩ của bạn
                </label>
                <textarea
                  rows="3"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  placeholder="Đà Nẵng thật tuyệt vời..."
                  className="w-full bg-[#E5EDF4]/50 border border-transparent text-[#002045] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                ></textarea>
              </div>

              {/* RATING & BONUS ĐIỂM (THEO THIẾT KẾ MỚI) */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon
                      key={star}
                      icon={faStar}
                      className={`cursor-pointer text-xl transition-colors ${formData.rating >= star ? "text-[#85662B]" : "text-slate-200"}`}
                      onClick={() => setFormData({ ...formData, rating: star })}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[#C4391D] font-bold text-sm bg-red-50 px-3 py-1 rounded-full">
                  <span>+50</span>
                  <FontAwesomeIcon icon={faTrophy} className="text-xs" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#002045] hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-4 disabled:opacity-70"
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận & Tích điểm"}
              </button>
            </form>
          </div>
        </div>

        {/* TRENDING NOW */}
        <div className="w-full px-6 md:px-12 py-16 bg-white border-t border-slate-100 mt-8">
          <div
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
            data-aos="fade-up"
          >
            <div>
              <h2 className="text-[32px] font-extrabold text-[#002045] uppercase tracking-tight">
                TRENDING NOW
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Những điểm đến đang thu hút sự chú ý của cộng đồng Danasoul
                Azure tuần này.
              </p>
            </div>
            <button className="text-[#002045] font-bold text-sm hover:underline flex items-center gap-2 group">
              Xem tất cả{" "}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingPlaces.map((place, index) => (
              <div
                key={place.id}
                className="flex flex-col gap-4 group cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-md">
                  <img
                    src={place.image}
                    alt={place.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute top-5 left-5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {place.tag}
                  </div>
                  <div className="absolute bottom-6 left-5 text-white">
                    <p className="text-xs flex items-center gap-2 opacity-90 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-[10px] text-white/70"
                      />{" "}
                      {place.location}
                    </p>
                    <h3 className="text-2xl font-bold tracking-wide">
                      {place.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 border border-white shadow-sm"></div>
                      <div className="w-5 h-5 rounded-full bg-slate-300 border border-white shadow-sm"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      + {place.checkins} CHECK-INS
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md">
                    +{place.points} Điểm
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>

      <button
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#C4391D] text-white font-bold px-8 py-3.5 rounded-full shadow-[0_10px_30px_rgba(196,57,29,0.4)] flex items-center gap-3 hover:scale-105 transition-all z-50"
        data-aos="zoom-in"
        data-aos-delay="500"
      >
        <FontAwesomeIcon icon={faArrowDown} className="animate-bounce" /> Đổi
        voucher ngay
      </button>
    </div>
  );
};

export default CheckinPage;
