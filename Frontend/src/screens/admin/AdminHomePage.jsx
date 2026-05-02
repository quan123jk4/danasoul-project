import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// IMPORT 2 COMPONENT DÙNG CHUNG (Nhớ đảm bảo đường dẫn này đúng với thư mục của ông)
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

// === IMPORT THƯ VIỆN BIỂU ĐỒ ===
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Hàm tính thời gian
const timeAgo = (dateInput) => {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

export default function AdminHomePage() {
  const navigate = useNavigate();

  // KHAI BÁO STATE
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalPlaces: 0,
      activeVouchers: 0,
      pendingFeedbacks: 0,
    },
    recentFeedbacks: [],
    topPlaces: [],
    chartData: [],
    systemAlerts: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // GỌI API LẤY DỮ LIỆU
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const response = await axios.get(
          "http://localhost:5000/api/v1/admin/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thật:", err);
        setError("Không thể tải dữ liệu từ máy chủ.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
        <div className="animate-spin w-12 h-12 border-4 border-[#C4391D] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const STATS_UI = [
    {
      label: "Tổng Người Dùng",
      value: data.stats.totalUsers,
      trendNum: "Tài khoản",
      isPositive: true,
      iconColor: "bg-blue-50 text-blue-600",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      ),
    },
    {
      label: "Địa Điểm Di Sản",
      value: data.stats.totalPlaces,
      trendNum: "Đang quản lý",
      isPositive: true,
      iconColor: "bg-emerald-50 text-emerald-600",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m3-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      ),
    },
    {
      label: "Voucher Hệ thống",
      value: data.stats.activeVouchers,
      trendNum: "Tổng phát hành",
      isPositive: true,
      iconColor: "bg-purple-50 text-purple-600",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
        />
      ),
    },
    {
      label: "Tổng Review",
      value: data.stats.pendingFeedbacks,
      trendNum: "Trên hệ thống",
      isPositive: true,
      iconColor: "bg-red-50 text-red-600",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans text-slate-900">
      {/* 1. COMPONENT SIDEBAR */}
      <Sidebar />

      <main className="ml-64 flex flex-col min-h-screen">
        {/* 2. COMPONENT HEADER */}
        <Header
          title="Hệ Thống Quản Trị"
          subtitle="Theo dõi và kiểm duyệt dữ liệu Danasoul"
        />

        <div className="p-10 flex-1 space-y-8 max-w-7xl mx-auto w-full">
          {error && (
            <div className="p-4 text-sm font-semibold text-red-800 rounded-2xl bg-red-50 border border-red-200">
              <span className="font-black">Cảnh báo:</span> {error}
            </div>
          )}

          {/* DÒNG 1: THẺ CHỈ SỐ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_UI.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </span>
                  <div
                    className={`p-2.5 rounded-xl ${stat.iconColor} group-hover:scale-110 transition-transform`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {stat.icon}
                    </svg>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <span className="text-4xl font-black text-slate-800 tracking-tighter">
                    {stat.value.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${stat.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600 animate-pulse"}`}
                  >
                    {stat.trendNum}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* DÒNG 2: BIỂU ĐỒ & CẢNH BÁO HOẠT ĐỘNG */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Biểu đồ (Chiếm 2/3) */}
            <div className="lg:col-span-2 bg-white rounded-[20px] shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  📈 Lượng truy cập 7 ngày qua
                </h2>
              </div>
              <div className="w-full h-80">
                {data.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorCheckin"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#C4391D"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#C4391D"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorUsers"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#002045"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#002045"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelStyle={{ fontWeight: "bold", color: "#0f172a" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="newUsers"
                        name="Người dùng mới"
                        stroke="#002045"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                      />
                      <Area
                        type="monotone"
                        dataKey="checkin"
                        name="Lượt Check-in"
                        stroke="#C4391D"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCheckin)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Không có dữ liệu
                  </div>
                )}
              </div>
            </div>

            {/* Hoạt động hệ thống (Chiếm 1/3) */}
            <div className="lg:col-span-1 bg-white rounded-[20px] shadow-sm border border-slate-100 p-8 flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                🔔 Hoạt động & Cảnh báo
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 space-y-5">
                {data.systemAlerts.length > 0 ? (
                  data.systemAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="relative pl-6 before:absolute before:left-1 before:top-2 before:bottom-[-20px] last:before:hidden before:w-0.5 before:bg-slate-100"
                    >
                      <div
                        className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ${
                          alert.type === "danger"
                            ? "bg-red-500 ring-red-100"
                            : alert.type === "success"
                              ? "bg-emerald-500 ring-emerald-100"
                              : alert.type === "warning"
                                ? "bg-amber-500 ring-amber-100"
                                : "bg-blue-500 ring-blue-100"
                        }`}
                      ></div>
                      <p
                        className={`text-sm font-bold mb-1 ${alert.type === "danger" ? "text-red-600" : "text-slate-800"}`}
                      >
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {alert.msg}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">
                        {timeAgo(alert.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center mt-10">
                    Chưa có hoạt động nào gần đây.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* DÒNG 3: BẢNG REVIEW & ĐỊA ĐIỂM */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Địa điểm */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-8 lg:col-span-1">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                🌟 Địa điểm nổi bật nhất
              </h2>
              {data.topPlaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <p className="text-sm font-medium">Chưa có dữ liệu.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.topPlaces.map((place, idx) => (
                    <div
                      key={place._id || idx}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-[14px] flex items-center justify-center font-black text-lg ${idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-slate-100 text-slate-500" : "bg-orange-50 text-orange-600"}`}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm mb-0.5">
                            {place.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {place.rating || 5.0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bảng Review */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden lg:col-span-2 flex flex-col">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  📝 Review Mới Nhất
                </h2>
                {/* Thêm link nhỏ nhảy sang trang quản lý Review */}
                <a
                  href="/admin/reviews"
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Xem chi tiết &rarr;
                </a>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-[#f8fafc] text-slate-400 uppercase text-[11px] font-black tracking-wider">
                    <tr>
                      <th className="px-8 py-5">Người dùng</th>
                      <th className="px-8 py-5">Địa điểm</th>
                      <th className="px-8 py-5">Nội dung đánh giá</th>
                      <th className="px-8 py-5 text-right">Thời gian</th>{" "}
                      {/* Đổi tên cột */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentFeedbacks.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-8 py-12 text-center text-slate-400"
                        >
                          Không có review mới.
                        </td>
                      </tr>
                    ) : (
                      data.recentFeedbacks.map((fb) => (
                        <tr
                          key={fb._id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-8 py-5 font-bold text-slate-800">
                            {fb.user?.fullName || "Ẩn danh"}
                          </td>
                          <td className="px-8 py-5 font-semibold text-indigo-600">
                            {fb.place?.name || "N/A"}
                          </td>
                          <td className="px-8 py-5 max-w-[250px] truncate text-slate-500 font-medium">
                            {fb.comment}
                          </td>
                          {/* Đổi 2 cái nút thành hiển thị thời gian */}
                          <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                            {fb.createdAt
                              ? new Date(fb.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "Gần đây"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
