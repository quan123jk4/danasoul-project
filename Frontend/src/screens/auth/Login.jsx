import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faQuestionCircle,
  faGlobe,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebookF } from "@fortawesome/free-brands-svg-icons";

const Login = () => {
  // === STATE QUẢN LÝ DỮ LIỆU FORM ===
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State xử lý lỗi và loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // === HÀM XỬ LÝ ĐĂNG NHẬP ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset lỗi cũ

    // Validate sơ bộ
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    setLoading(true);
    try {
      // Gọi API Login tới Backend của ông (Giả sử chạy port 5000, nhớ sửa nếu khác)
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        {
          email,
          password,
        },
      );

      // Nếu thành công: Lưu token và thông tin user vào localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Chuyển hướng vào trang chủ (ông có thể đổi "/home" thành route ông muốn)
      navigate("/home");
    } catch (err) {
      // Bắt lỗi từ Backend trả về (Tài khoản khóa, sai pass, không tồn tại...)
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến Server. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#fcfdfe] font-sans overflow-hidden">
      <div className="relative hidden w-1/2 lg:block bg-black">
        <img
          src="/assets/cau-rong.jpg"
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80"></div>

        <div className="absolute top-12 left-14 flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-[10px] bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
              <path d="M4 12c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
              <path d="M4 17c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
            </svg>
          </div>
          <span className="text-white text-[22px] font-extrabold tracking-tight">
            Danasoul
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col justify-center px-14 z-10 mt-4">
          <h2 className="text-[60px] font-black leading-[1.05] tracking-[-0.03em] mb-6 drop-shadow-lg">
            <div className="text-white">Di sản trong</div>
            <div className="text-[#C4D4F5]">từng chuyển</div>
            <div className="text-[#C4D4F5]">động.</div>
          </h2>
          <p className="max-w-[420px] text-white/95 text-[15px] font-normal leading-relaxed">
            Hành trình khám phá vẻ đẹp vượt thời gian của Đà <br /> Nẵng bắt đầu
            từ sự thấu cảm và tinh tế.
          </p>
        </div>

        <div className="absolute bottom-12 left-14 flex gap-10 text-[11px] font-bold tracking-[0.25em] text-[#94A3B8] uppercase z-10">
          <span>Heritage</span>
          <span>Modernity</span>
          <span>Soul</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* BÊN PHẢI: FORM ĐĂNG NHẬP + TÍCH HỢP API */}
      {/* ========================================== */}
      <div className="flex w-full flex-col justify-center px-8 md:px-24 lg:w-1/2">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-gray-100 overflow-hidden">
              <img
                src="/assets/logo.png"
                alt="logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              Chào mừng bạn trở lại
            </h1>
            <p className="text-slate-500 font-medium">
              Truy cập để tiếp tục hành trình khám phá Đà Nẵng.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* IN RA LỖI TỪ BACKEND NẾU CÓ */}
            {error && (
              <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Địa chỉ Email
              </label>
              <div className="relative group">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#468045]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@danasoul.vn"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 outline-none focus:border-[#468045] transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-red-800 underline underline-offset-4"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#468045]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 outline-none focus:border-[#468045] transition-all text-sm shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    size="sm"
                  />
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className={`w-full rounded-2xl py-4 font-bold text-white shadow-xl transition-all transform active:scale-[0.99] ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#1e293b] hover:bg-black"
              }`}
            >
              {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold shadow-sm"
              >
                <FontAwesomeIcon icon={faGoogle} className="text-red-500" />{" "}
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold shadow-sm"
              >
                <FontAwesomeIcon icon={faFacebookF} className="text-blue-600" />{" "}
                Facebook
              </button>
            </div>
          </form>

          <p className="mt-12 text-center text-sm font-medium text-slate-500">
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-bold text-red-800 underline underline-offset-4 hover:text-red-600"
            >
              Tham gia ngay
            </Link>
          </p>
        </div>
      </div>

      {/* FOOTER ICONS */}
      <div className="absolute bottom-10 right-10 flex gap-4 lg:text-slate-400 text-slate-400">
        <button className="w-10 h-10 bg-white/50 border border-slate-200 rounded-full flex items-center justify-center hover:bg-white transition shadow-sm">
          <FontAwesomeIcon icon={faQuestionCircle} />
        </button>
        <button className="w-10 h-10 bg-white/50 border border-slate-200 rounded-full flex items-center justify-center hover:bg-white transition shadow-sm">
          <FontAwesomeIcon icon={faGlobe} />
        </button>
      </div>
    </div>
  );
};

export default Login;
