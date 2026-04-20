import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faLock,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebookF } from "@fortawesome/free-brands-svg-icons";

const Register = () => {
  const bgImage =
    "https://w-vietnam.com/wp-content/uploads/2021/04/Ngu-Hanh-Son-marble-mountain.jpg";

  return (
    <div className="flex min-h-screen w-full bg-[#fcfdfe] font-sans overflow-hidden">
      {/* 1. BÊN TRÁI: ẢNH VÀ CHỮ (Căn giữa dọc chuẩn xác) */}
      <div className="relative hidden w-1/2 lg:block bg-[#0A192F]">
        <img
          src={bgImage}
          alt="Background"
          className="h-full w-full object-cover opacity-40 mix-blend-overlay"
        />
        {/* Dùng justify-center để nội dung nằm ngay giữa, KHÔNG bị tụt xuống dưới */}
        <div className="absolute inset-0 flex flex-col justify-center px-20 text-white bg-gradient-to-t from-[#0A192F] via-[#0A192F]/50 to-transparent">
          {/* Ô vuông trắng trống như thiết kế */}
          <div className="mb-8 w-12 h-12 bg-white"></div>

          <h2 className="text-[54px] font-bold leading-[1.1] mb-6 tracking-tight">
            Khám phá di sản <br />
            trong từng{" "}
            <span className="text-[#FBBF24]">
              chuyển
              <br />
              động.
            </span>
          </h2>

          <p className="max-w-[420px] text-[#CBD5E1] text-[15px] font-light leading-relaxed mb-12">
            Chào mừng bạn đến với Danasoul — không gian lưu giữ vẻ đẹp Đà Thành,
            nơi mỗi trải nghiệm là một câu chuyện văn hóa được kể bằng ngôn ngữ
            hiện đại.
          </p>

          {/* Avatars */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="user"
                className="w-9 h-9 rounded-full border-2 border-[#0A192F] object-cover"
              />
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="user"
                className="w-9 h-9 rounded-full border-2 border-[#0A192F] object-cover"
              />
              <img
                src="https://randomuser.me/api/portraits/men/46.jpg"
                alt="user"
                className="w-9 h-9 rounded-full border-2 border-[#0A192F] object-cover"
              />
            </div>
            <span className="text-[11px] text-[#94A3B8] font-medium tracking-wide">
              Tham gia cùng 10,000+ người yêu văn hóa Đà Nẵng
            </span>
          </div>
        </div>
      </div>

      {/* 2. BÊN PHẢI: FORM ĐĂNG KÝ (Cấu trúc giữ nguyên từ Login để chống lệch) */}
      <div className="flex w-full flex-col justify-center px-8 md:px-24 lg:w-1/2 relative">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2 tracking-tight">
              Bắt đầu hành trình
            </h1>
            <p className="text-[#64748B] text-sm">
              Kiến tạo trải nghiệm di sản của riêng bạn.
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* HỌ TÊN */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                HỌ TÊN
              </label>
              <div className="relative group">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"
                />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-xl border-none bg-[#E2E8F0]/60 py-3.5 pl-11 pr-4 outline-none focus:bg-[#E2E8F0] transition-all text-sm font-medium text-[#1E293B] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                EMAIL
              </label>
              <div className="relative group">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"
                />
                <input
                  type="email"
                  placeholder="example@danasoul.vn"
                  className="w-full rounded-xl border-none bg-[#E2E8F0]/60 py-3.5 pl-11 pr-4 outline-none focus:bg-[#E2E8F0] transition-all text-sm font-medium text-[#1E293B] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* MẬT KHẨU */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                MẬT KHẨU
              </label>
              <div className="relative group">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"
                />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border-none bg-[#E2E8F0]/60 py-3.5 pl-11 pr-4 outline-none focus:bg-[#E2E8F0] transition-all text-sm font-medium text-[#1E293B] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* XÁC NHẬN MẬT KHẨU */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                XÁC NHẬN MẬT KHẨU
              </label>
              <div className="relative group">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"
                />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border-none bg-[#E2E8F0]/60 py-3.5 pl-11 pr-4 outline-none focus:bg-[#E2E8F0] transition-all text-sm font-medium text-[#1E293B] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* CHECKBOX */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] accent-[#172554] cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-xs text-[#64748B] leading-relaxed cursor-pointer"
              >
                Tôi đồng ý với{" "}
                <span className="text-[#1E293B] font-bold hover:underline">
                  Điều khoản dịch vụ
                </span>{" "}
                và{" "}
                <span className="text-[#1E293B] font-bold hover:underline">
                  Chính sách bảo mật
                </span>{" "}
                của Danasoul.
              </label>
            </div>

            <button className="w-full rounded-xl bg-[#172554] py-3.5 font-bold text-white hover:bg-[#0A192F] transition-all mt-4 text-sm flex justify-center items-center gap-2">
              Đăng ký →
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#fcfdfe] px-4 text-[#94A3B8]">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-2.5 text-xs font-bold text-[#475569] hover:bg-gray-50 transition-all shadow-sm">
                <FontAwesomeIcon
                  icon={faGoogle}
                  className="text-[#EA4335] text-sm"
                />{" "}
                Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-2.5 text-xs font-bold text-[#475569] hover:bg-gray-50 transition-all shadow-sm">
                <FontAwesomeIcon
                  icon={faFacebookF}
                  className="text-[#1877F2] text-sm"
                />{" "}
                Facebook
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-[13px] font-medium text-[#64748B]">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-bold text-[#DC2626] hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Bản quyền ở góc dưới như ảnh */}
        <div className="absolute bottom-6 w-full text-center left-0">
          <p className="text-[10px] text-[#94A3B8] tracking-wide">
            © 2024 Danasoul. Di sản trong từng chuyển động.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
