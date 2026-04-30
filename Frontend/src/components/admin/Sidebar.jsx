import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  // Hàm kiểm tra route đang active để đổi màu
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center h-20 px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#002045] to-[#C4391D] rounded-[10px] flex items-center justify-center shadow-lg shadow-[#002045]/20">
            <svg
              className="w-4.5 h-4.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">
            Danasoul<span className="text-[#C4391D]">Admin</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
        {/* NÚT VỀ TRANG CHỦ */}
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 bg-red-50 text-[#C4391D] hover:bg-[#C4391D] hover:text-white rounded-[14px] font-bold transition-all duration-300 mb-8 border border-red-100/50 shadow-sm group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Về Trang Chủ
        </Link>

        {/* MENU CHÍNH */}
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
          Menu Chính
        </div>
        <Link
          to="/admin"
          className={`flex items-center gap-3 px-4 py-3 rounded-[14px] font-bold transition-all duration-200 ${
            isActive("/admin")
              ? "bg-[#002045] text-white shadow-md shadow-[#002045]/20"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Dashboard
        </Link>

        {/* QUẢN LÝ DỮ LIỆU */}
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-8 px-2">
          Quản lý Dữ liệu
        </div>
        <Link
          to="/admin/users"
          className={`flex items-center gap-3 px-4 py-3 rounded-[14px] font-bold transition-all duration-200 ${
            isActive("/admin/users")
              ? "bg-[#002045] text-white shadow-md shadow-[#002045]/20"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Người dùng
        </Link>

        <Link
          to="/admin/places"
          className={`flex items-center gap-3 px-4 py-3 rounded-[14px] font-bold transition-all duration-200 ${
            isActive("/admin/places")
              ? "bg-[#002045] text-white shadow-md shadow-[#002045]/20"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m3-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Địa điểm (Di sản)
        </Link>

        <Link
          to="/admin/reviews"
          className={`flex items-center gap-3 px-4 py-3 rounded-[14px] font-bold transition-all duration-200 ${
            isActive("/admin/reviews")
              ? "bg-[#002045] text-white shadow-md shadow-[#002045]/20"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          Đánh giá (Reviews)
        </Link>

        {/* NÚT QUẢN LÝ VOUCHER MỚI THÊM VÀO ĐÂY */}
        <Link
          to="/admin/vouchers"
          className={`flex items-center gap-3 px-4 py-3 rounded-[14px] font-bold transition-all duration-200 ${
            isActive("/admin/vouchers")
              ? "bg-[#002045] text-white shadow-md shadow-[#002045]/20"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          Voucher (Quà tặng)
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
