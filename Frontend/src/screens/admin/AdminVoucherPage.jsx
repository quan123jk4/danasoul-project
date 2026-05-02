import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

export default function AdminVoucherPage() {
  // === STATE DỮ LIỆU ===
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // === STATE TÌM KIẾM & LỌC ===
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // === STATE MODAL ===
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
    isAlertOnly: true,
    onConfirm: null,
  });

  // === STATE FORM THÊM MỚI ===
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discountValue: "",
    partnerName: "",
    pointsRequired: "",
    quantity: "",
    expirationDate: "",
    category: "Ẩm thực", // Thêm trường này, mặc định là Ẩm thực
  });

  // === KHAI BÁO LINK API TỪ BACKEND CỦA ÔNG ===
  const API_GET_VOUCHERS = "http://localhost:5000/api/v1/vouchers/admin/list";
  const API_CREATE_VOUCHER =
    "http://localhost:5000/api/v1/vouchers/admin/create";

  // === GỌI API LẤY DATA NGAY KHI VÀO TRANG ===
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_GET_VOUCHERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        // Cập nhật state và sắp xếp voucher mới nhất lên đầu
        setVouchers(
          res.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách Voucher:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // === THỐNG KÊ DATA ĐỂ HIỂN THỊ TRÊN 3 Ô ĐẦU TRANG ===
  const stats = useMemo(() => {
    const total = vouchers.length;
    // Voucher hợp lệ: Còn Active + Chưa hết hạn + Chưa hết số lượng
    const active = vouchers.filter(
      (v) =>
        v.isActive &&
        new Date(v.expirationDate) > new Date() &&
        (v.usedCount || 0) < v.quantity,
    ).length;
    // Tổng số lượt đã đổi của tất cả voucher
    const totalRedeemed = vouchers.reduce(
      (acc, v) => acc + (v.usedCount || 0),
      0,
    );
    return { total, active, totalRedeemed };
  }, [vouchers]);

  // === XỬ LÝ THÊM VOUCHER ===
  const handleAddVoucher = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const payload = {
        title: formData.title,
        code: formData.code,
        discountValue: formData.discountValue,
        partnerName: formData.partnerName,
        pointsRequired: Number(formData.pointsRequired),
        quantity: Number(formData.quantity),
        expirationDate: formData.expirationDate,
        category: formData.category, // BỔ SUNG DÒNG NÀY
        isActive: true,
      };
      const res = await axios.post(API_CREATE_VOUCHER, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        fetchVouchers(); // Refresh lại danh sách từ DB
        setIsAddModalOpen(false);
        setFormData({
          title: "",
          code: "",
          discount: "",
          pointsRequired: "",
          quantity: "",
          expirationDate: "",
          discountValue: "",
          partnerName: "",
          category: "Ẩm thực",
        });
        setModal({
          isOpen: true,
          title: "Thành công",
          message: "Đã phát hành Voucher mới vào hệ thống!",
          type: "success",
          isAlertOnly: true,
        });
      }
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        title: "Lỗi thêm mới",
        message:
          err.response?.data?.message ||
          "Không thể lưu vào DB. Vui lòng kiểm tra lại!",
        type: "danger",
        isAlertOnly: true,
      });
    }
  };

  // === XÓA VOUCHER ===
  const handleDeleteClick = (id) => {
    setModal({
      isOpen: true,
      title: "Xóa Voucher",
      message: "Bạn có chắc chắn muốn thu hồi và xóa Voucher này không?",
      type: "danger",
      isAlertOnly: false,
      onConfirm: () => executeDelete(id),
    });
  };

  // === XÓA VOUCHER BẰNG API THẬT ===
  const executeDelete = async (id) => {
    // Đóng cái modal xác nhận trước
    setModal({ ...modal, isOpen: false });

    try {
      const token = localStorage.getItem("token");

      // Gọi API DELETE xuống Backend
      const res = await axios.delete(
        `http://localhost:5000/api/v1/vouchers/admin/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        // Xóa thành công thì lọc cái voucher đó ra khỏi state (để nó biến mất trên màn hình lập tức)
        setVouchers(vouchers.filter((v) => v._id !== id));

        // Hiện popup báo thành công
        setTimeout(() => {
          setModal({
            isOpen: true,
            title: "Đã xóa",
            message: "Voucher đã được thu hồi và xóa khỏi hệ thống.",
            type: "success",
            isAlertOnly: true,
          });
        }, 300);
      }
    } catch (err) {
      console.error(err);
      // Hiện popup báo lỗi nếu Backend chửi
      setTimeout(() => {
        setModal({
          isOpen: true,
          title: "Lỗi",
          message: err.response?.data?.message || "Không thể xóa Voucher này.",
          type: "danger",
          isAlertOnly: true,
        });
      }, 300);
    }
  };

  // === LỌC & PHÂN TRANG ===
  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch = `${v.title} ${v.code}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const used = v.usedCount || 0;
    const isExpiredOrEmpty =
      !v.isActive ||
      new Date(v.expirationDate) < new Date() ||
      used >= v.quantity;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" ? !isExpiredOrEmpty : isExpiredOrEmpty);
    return matchesSearch && matchesStatus;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = filteredVouchers.slice(
    indexOfLast - itemsPerPage,
    indexOfLast,
  );
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 flex flex-col min-h-screen relative">
        <Header
          title="Quản Lý Voucher"
          subtitle="Tạo mã giảm giá và quản lý kho quà tặng cho người dùng"
        />

        <div className="p-10 flex-1 space-y-8 max-w-7xl mx-auto w-full">
          {/* 1. THỐNG KÊ & NÚT THÊM */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
            <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm min-w-[200px] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Tổng Voucher
                  </p>
                  <h4 className="text-2xl font-black text-slate-800">
                    {stats.total}
                  </h4>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm min-w-[200px] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Đang Hoạt Động
                  </p>
                  <h4 className="text-2xl font-black text-slate-800">
                    {stats.active}
                  </h4>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm min-w-[200px] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Lượt Đã Đổi
                  </p>
                  <h4 className="text-2xl font-black text-slate-800">
                    {stats.totalRedeemed}
                  </h4>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-4 rounded-xl font-bold bg-[#002045] text-white hover:bg-blue-900 transition-all shadow-lg flex items-center gap-2 shrink-0"
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
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Phát hành Voucher
            </button>
          </div>

          {/* 2. THANH CÔNG CỤ TÌM KIẾM */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[20px] shadow-sm border border-slate-100">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm theo tên quà tặng, mã code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#C4391D]"
              />
              <svg
                className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#f8fafc] border border-slate-200 text-sm rounded-xl px-4 py-3.5 focus:outline-none font-bold text-slate-700 md:w-[200px] cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">🟢 Còn hiệu lực</option>
              <option value="INACTIVE">🔴 Hết hạn / Hết lượt</option>
            </select>
          </div>

          {/* 3. BẢNG DỮ LIỆU */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead className="bg-[#f8fafc] text-slate-400 uppercase text-[11px] font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 w-[35%]">Thông tin Voucher</th>
                    <th className="px-6 py-5 text-center">Điểm Yêu Cầu</th>
                    <th className="px-6 py-5 text-center">Kho / Đã đổi</th>
                    <th className="px-6 py-5 text-center">Trạng Thái</th>
                    <th className="px-6 py-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-[#C4391D] border-t-transparent rounded-full mx-auto"></div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-20 font-medium text-slate-500"
                      >
                        Chưa có voucher nào.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((v) => {
                      const used = v.usedCount || 0;
                      const isExpired = new Date(v.expirationDate) < new Date();
                      const isSoldOut = used >= v.quantity;
                      const isValid = v.isActive && !isExpired && !isSoldOut;

                      return (
                        <tr
                          key={v._id}
                          className={`transition-colors group ${isValid ? "hover:bg-[#fcfdfe]" : "bg-slate-50/50"}`}
                        >
                          {/* Cột 1: Thông tin */}
                          <td className="px-6 py-5 align-middle">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${isValid ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm" : "bg-slate-100 border-slate-200"}`}
                              >
                                <svg
                                  className={`w-6 h-6 ${isValid ? "text-blue-600" : "text-slate-400"}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                  />
                                </svg>
                              </div>
                              <div className="flex flex-col">
                                <span
                                  className={`font-extrabold text-[14px] line-clamp-1 ${isValid ? "text-slate-800" : "text-slate-500"}`}
                                >
                                  {v.title}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-[11px] font-black px-2 py-0.5 rounded tracking-widest ${isValid ? "text-[#C4391D] bg-red-50" : "text-slate-500 bg-slate-100"}`}
                                  >
                                    {v.code}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    HSD:{" "}
                                    {new Date(
                                      v.expirationDate,
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cột 2: Điểm đổi */}
                          <td className="px-6 py-5 align-middle text-center">
                            <span
                              className={`text-[13px] font-black px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${isValid ? "text-amber-600 bg-amber-50" : "text-slate-400 bg-slate-100"}`}
                            >
                              {v.pointsRequired}{" "}
                              <svg
                                className="w-3.5 h-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </td>

                          {/* Cột 3: Số lượng */}
                          <td className="px-6 py-5 align-middle text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[13px] font-bold text-slate-700">
                                {used}{" "}
                                <span className="text-slate-400 font-medium">
                                  / {v.quantity}
                                </span>
                              </span>
                              <div className="w-full max-w-[80px] h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isSoldOut ? "bg-red-500" : "bg-blue-500"}`}
                                  style={{
                                    width: `${Math.min((used / v.quantity) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Cột 4: Trạng thái */}
                          <td className="px-6 py-5 align-middle text-center">
                            <span
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 border ${
                                isValid
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : isSoldOut
                                    ? "bg-slate-50 text-slate-500 border-slate-200"
                                    : "bg-red-50 text-red-500 border-red-100"
                              }`}
                            >
                              {isValid ? (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{" "}
                                  Đang phát hành
                                </>
                              ) : isSoldOut ? (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>{" "}
                                  Đã hết lượt
                                </>
                              ) : (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{" "}
                                  Đã hết hạn
                                </>
                              )}
                            </span>
                          </td>

                          {/* Cột 5: Thao tác */}
                          <td className="px-6 py-5 align-middle text-right">
                            <button
                              onClick={() => handleDeleteClick(v._id)}
                              className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                              title="Xóa"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Trang <span className="text-[#002045]">{currentPage}</span> /{" "}
                  {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* MODAL THÊM VOUCHER */}
        {/* ========================================== */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
              <form
                onSubmit={handleAddVoucher}
                className="flex flex-col h-full"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">
                      Phát hành Voucher
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">
                      Tạo phần thưởng cho người dùng check-in
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-2xl font-black"
                  >
                    ×
                  </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">
                      Tên Voucher (*)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="VD: Giảm 50.000đ tại Highland Coffee"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#002045] focus:bg-white transition-colors font-medium text-slate-700"
                    />
                  </div>
                  {/* Ô CHỌN DANH MỤC */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">
                      Danh mục (*)
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#002045] focus:bg-white transition-colors font-medium text-slate-700 cursor-pointer"
                    >
                      <option value="Ẩm thực">🍔 Ẩm thực</option>
                      <option value="Khách sạn">🏨 Khách sạn</option>
                      <option value="Giải trí">🎡 Giải trí</option>
                      <option value="Di chuyển">🚕 Di chuyển</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">
                      Đối tác / Cửa hàng (*)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="VD: Highland Coffee"
                      value={formData.partnerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          partnerName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#002045] focus:bg-white transition-colors font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">
                      Giá trị giảm (*)
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="VD: 50000 (VND) hoặc 20 (%)"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#002045] focus:bg-white transition-colors font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">
                      Mã Code (*)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="VD: HL50K"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#C4391D] focus:bg-white transition-colors font-black text-slate-700 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">
                      Điểm yêu cầu (*)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="VD: 500"
                      value={formData.pointsRequired}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pointsRequired: e.target.value,
                        })
                      }
                      className="w-full bg-amber-50/50 border border-amber-200/60 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:bg-amber-50 transition-colors font-black text-amber-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">
                      Số lượng phát hành (*)
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="VD: 100"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#002045] focus:bg-white transition-colors font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">
                      Hạn sử dụng (*)
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expirationDate: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#002045] focus:bg-white transition-colors font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-8 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3.5 rounded-xl font-bold bg-[#002045] text-white hover:bg-blue-900 transition-all shadow-lg"
                  >
                    Lưu Voucher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL THÔNG BÁO CHUNG */}
        {/* ========================================== */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[24px] shadow-2xl w-[90%] max-w-[400px] overflow-hidden flex flex-col transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
              <div className="p-8 flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${modal.type === "success" ? "bg-emerald-50 text-emerald-500" : modal.type === "warning" ? "bg-amber-50 text-amber-500" : "bg-red-50 text-red-500"}`}
                >
                  {modal.type === "success" ? (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-[19px] font-black text-slate-800 mb-2.5">
                  {modal.title}
                </h3>
                <p className="text-slate-500 font-medium text-[14px] leading-relaxed">
                  {modal.message}
                </p>
              </div>
              <div className="bg-slate-50 px-6 py-5 flex items-center justify-center gap-3 border-t border-slate-100">
                {modal.isAlertOnly ? (
                  <button
                    onClick={() => setModal({ ...modal, isOpen: false })}
                    className={`w-full py-3 rounded-xl font-bold text-[13px] text-white shadow-md transition-colors ${modal.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : modal.type === "warning" ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600"}`}
                  >
                    Đóng
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setModal({ ...modal, isOpen: false })}
                      className="flex-1 py-3 rounded-xl font-bold text-[13px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={modal.onConfirm}
                      className="flex-1 py-3 rounded-xl font-bold text-[13px] text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors"
                    >
                      Xác nhận Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
