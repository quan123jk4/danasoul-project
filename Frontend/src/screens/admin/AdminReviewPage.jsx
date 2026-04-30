import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

export default function AdminReviewPage() {
  const { user } = useAuth();

  // === STATE QUẢN LÝ DỮ LIỆU ===
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // LỌC DỮ LIỆU
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  // TRẢ LỜI REVIEW
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // MODAL CHUNG
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    isAlertOnly: false,
    onConfirm: null,
  });

  const API_BASE_URL = "http://localhost:5000/api/v1/reviews";

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setReviews(
          res.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, statusFilter]);

  // === THỐNG KÊ DATA ===
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => !r.isApproved).length;
    const avgRating =
      total > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
        : 0;
    return { total, pending, avgRating };
  }, [reviews]);

  // === HÀM XỬ LÝ ===
  const handleDeleteClick = (reviewId) => {
    setModal({
      isOpen: true,
      title: "Xóa Đánh giá",
      message:
        "Bạn có chắc chắn muốn xóa bài đánh giá này? Thao tác không thể hoàn tác!",
      type: "danger",
      isAlertOnly: false,
      onConfirm: () => executeDelete(reviewId),
    });
  };

  const executeDelete = async (reviewId) => {
    setModal({ ...modal, isOpen: false });
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      setTimeout(
        () =>
          setModal({
            isOpen: true,
            title: "Lỗi",
            message: "Không thể xóa bài đánh giá.",
            type: "danger",
            isAlertOnly: true,
          }),
        300,
      );
    }
  };

  const handleToggleApprove = async (review) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_BASE_URL}/${review._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setReviews(
          reviews.map((r) =>
            r._id === review._id ? { ...r, isApproved: !r.isApproved } : r,
          ),
        );
      }
    } catch (err) {
      setModal({
        isOpen: true,
        title: "Lỗi",
        message: "Không thể cập nhật trạng thái.",
        type: "danger",
        isAlertOnly: true,
      });
    }
  };

  const handleSaveReply = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_BASE_URL}/${reviewId}/reply`,
        { adminReply: replyText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setReviews(
          reviews.map((r) =>
            r._id === reviewId ? { ...r, adminReply: replyText } : r,
          ),
        );
        setReplyingId(null);
        setReplyText("");
        setModal({
          isOpen: true,
          title: "Thành công",
          message: "Đã lưu phản hồi của bạn!",
          type: "success",
          isAlertOnly: true,
        });
      }
    } catch (err) {
      setModal({
        isOpen: true,
        title: "Lỗi",
        message: "Lỗi khi lưu phản hồi",
        type: "danger",
        isAlertOnly: true,
      });
    }
  };

  // === LOGIC LỌC ===
  const filteredReviews = reviews.filter((r) => {
    const searchString =
      `${r.user?.fullName} ${r.user?.username} ${r.place?.name} ${r.comment}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesRating =
      ratingFilter === "ALL" || r.rating.toString() === ratingFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "APPROVED" ? r.isApproved : !r.isApproved);
    return matchesSearch && matchesRating && matchesStatus;
  });

  const indexOfLast = currentPage * reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfLast - reviewsPerPage,
    indexOfLast,
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 flex flex-col min-h-screen relative">
        <Header
          title="Quản Lý Đánh Giá"
          subtitle="Phân tích và Kiểm duyệt phản hồi từ cộng đồng Danasoul"
        />

        <div className="p-10 flex-1 space-y-8 max-w-7xl mx-auto w-full">
          {/* 1. KHU VỰC THỐNG KÊ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                <svg
                  className="w-7 h-7"
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
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tổng Đánh Giá
                </p>
                <h4 className="text-3xl font-black text-slate-800">
                  {stats.total}
                </h4>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-2xl">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Điểm Trung Bình
                </p>
                <h4 className="text-3xl font-black text-slate-800">
                  {stats.avgRating}{" "}
                  <span className="text-sm font-medium text-slate-400">
                    / 5.0
                  </span>
                </h4>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-[0_4px_20px_rgba(196,57,29,0.05)] flex items-center gap-5 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-2 h-full bg-[#C4391D]"></div>
              <div className="w-14 h-14 rounded-full bg-red-50 text-[#C4391D] flex items-center justify-center text-2xl">
                <svg
                  className="w-7 h-7"
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
                <p className="text-[11px] font-bold text-[#C4391D] uppercase tracking-wider mb-1">
                  Cần Xử Lý
                </p>
                <h4 className="text-3xl font-black text-slate-800">
                  {stats.pending}{" "}
                  <span className="text-sm font-medium text-slate-400">
                    Chờ duyệt
                  </span>
                </h4>
              </div>
            </div>
          </div>

          {/* 2. THANH CÔNG CỤ TÌM KIẾM & LỌC */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[20px] shadow-sm border border-slate-100">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm tên user, địa điểm, nội dung đánh giá..."
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
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-[#f8fafc] border border-slate-200 text-sm rounded-xl px-4 py-3.5 focus:outline-none font-bold text-slate-700 md:w-[160px] cursor-pointer"
            >
              <option value="ALL">Tất cả Sao</option>
              <option value="5">5 Sao</option>
              <option value="4">4 Sao</option>
              <option value="3">3 Sao</option>
              <option value="2">2 Sao</option>
              <option value="1">1 Sao</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#f8fafc] border border-slate-200 text-sm rounded-xl px-4 py-3.5 focus:outline-none font-bold text-slate-700 md:w-[180px] cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">⏳ Chờ duyệt</option>
              <option value="APPROVED">✓ Đã duyệt</option>
            </select>
          </div>

          {/* 3. BẢNG DỮ LIỆU */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto min-h-[460px]">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead className="bg-[#f8fafc] text-slate-400 uppercase text-[11px] font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 w-[20%]">Người Dùng</th>
                    <th className="px-6 py-5 w-[55%]">Đánh Giá & Phản Hồi</th>
                    <th className="px-6 py-5 text-center w-[15%]">Hình Ảnh</th>
                    <th className="px-6 py-5 text-right w-[10%]">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-[#C4391D] border-t-transparent rounded-full mx-auto"></div>
                      </td>
                    </tr>
                  ) : currentReviews.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-20 font-medium text-slate-500"
                      >
                        Không tìm thấy dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    currentReviews.map((r) => (
                      <tr
                        key={r._id}
                        className={`transition-colors group border-b border-slate-50 ${!r.isApproved ? "bg-amber-50/20" : "hover:bg-[#fcfdfe]"}`}
                      >
                        {/* 1. NGƯỜI DÙNG */}
                        <td className="px-6 py-5 align-top w-[20%]">
                          <div className="flex items-start gap-3">
                            <img
                              src={
                                r.user?.avatar ||
                                `https://ui-avatars.com/api/?name=${r.user?.fullName || "User"}&background=E5EDF4&color=002045`
                              }
                              alt="avatar"
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                            />
                            <div className="flex flex-col">
                              <span
                                className="font-bold text-[13px] text-slate-800 line-clamp-1"
                                title={r.user?.fullName || r.user?.username}
                              >
                                {r.user?.fullName ||
                                  r.user?.username ||
                                  "Ẩn danh"}
                              </span>
                              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                                {new Date(r.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. NỘI DUNG ĐÁNH GIÁ & PHẢN HỒI */}
                        <td className="px-6 py-5 align-top w-[55%]">
                          <div className="flex flex-col gap-1.5">
                            {/* Header: Stars, Location, Status */}
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {renderStars(r.rating)}
                              <div className="w-1 h-1 rounded-full bg-slate-300 mx-0.5"></div>
                              <span
                                className="text-[10px] font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100 truncate max-w-[150px]"
                                title={r.place?.name}
                              >
                                📍 {r.place?.name}
                              </span>
                              <button
                                onClick={() => handleToggleApprove(r)}
                                title={
                                  r.isApproved
                                    ? "Click để Ẩn bài"
                                    : "Click để Duyệt bài"
                                }
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer transition-colors shadow-sm ${r.isApproved ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"}`}
                              >
                                {r.isApproved ? "✓ Đã duyệt" : "⏳ Chờ duyệt"}
                              </button>
                            </div>

                            {/* Comment của khách */}
                            <p className="text-[13px] text-slate-700 font-medium leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg shadow-sm w-fit min-w-[50%]">
                              {r.comment || (
                                <span className="italic text-slate-400">
                                  Không có bình luận chữ.
                                </span>
                              )}
                            </p>

                            {/* Admin Reply */}
                            {replyingId === r._id ? (
                              <div className="mt-1 bg-slate-50 p-2.5 rounded-lg border border-blue-200 animate-in fade-in zoom-in-95 duration-200">
                                <textarea
                                  autoFocus
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Nhập câu trả lời cho khách..."
                                  className="w-full text-[13px] p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500 resize-none h-16 mb-2 bg-white shadow-inner"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setReplyingId(null)}
                                    className="px-3 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-200 rounded transition-colors"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    onClick={() => handleSaveReply(r._id)}
                                    className="px-3 py-1 text-[11px] font-bold text-white bg-[#002045] hover:bg-blue-900 rounded transition-colors shadow-sm"
                                  >
                                    Lưu Phản Hồi
                                  </button>
                                </div>
                              </div>
                            ) : r.adminReply ? (
                              <div className="mt-1 flex gap-2 w-fit min-w-[50%]">
                                <div className="w-0.5 bg-red-200 rounded-full my-1 ml-2"></div>
                                <div className="flex-1 bg-red-50/50 p-2.5 rounded-lg border border-red-50">
                                  <span className="text-[10px] font-black text-[#C4391D] uppercase tracking-wider mb-1 block">
                                    Danasoul Admin:
                                  </span>
                                  <p className="text-[12px] text-slate-700 font-medium leading-relaxed">
                                    {r.adminReply}
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* 3. HÌNH ẢNH */}
                        <td className="px-6 py-5 align-top text-center w-[15%]">
                          {r.media && r.media.length > 0 ? (
                            <div className="flex justify-center gap-1.5 flex-wrap">
                              {r.media.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt="media"
                                  className="w-10 h-10 rounded-md object-cover border border-slate-200 shadow-sm hover:scale-150 transition-transform cursor-pointer origin-center"
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-300 italic font-medium">
                              Không có
                            </span>
                          )}
                        </td>

                        {/* 4. THAO TÁC */}
                        <td className="px-6 py-5 align-top text-right w-[10%]">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setReplyingId(r._id);
                                setReplyText(r.adminReply || "");
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Trả lời khách hàng"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(r._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                              title="Xóa đánh giá"
                            >
                              <svg
                                className="w-3.5 h-3.5"
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
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all shadow-sm"
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
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all shadow-sm"
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

        {/* MODAL THÔNG BÁO */}
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
                    className={`w-full py-3 rounded-xl font-bold text-[13px] text-white shadow-md transition-colors ${modal.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
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
