import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// === 1. IMPORT CONTEXT & PROTECTED ROUTE (Theo đúng cây thư mục của ông) ===
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";

// === 2. IMPORT CÁC TRANG USER & AUTH ===
import Home from "./screens/user/Home";
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";
import ProfilePage from "./screens/user/ProfilePage";
import CheckinPage from "./screens/user/CheckinPage";
import AiSuggestPage from "./screens/user/AiSuggestPage";
import VoucherPage from "./screens/user/VoucherPage";
import HeritagePage from "./screens/user/HeritagePage";

// === 3. IMPORT TRANG ADMIN ===
import AdminHomePage from "./screens/admin/AdminHomePage";
import AdminUserPage from "./screens/admin/AdminUserPage";
import AdminPlacePage from "./screens/admin/AdminPlacePage";
import AdminReviewPage from "./screens/admin/AdminReviewPage";
import AdminVoucherPage from "./screens/admin/AdminVoucherPage";
function App() {
  return (
    // Bọc toàn bộ ứng dụng bằng AuthProvider để quản lý state đăng nhập
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          {/* ==========================================
              NHÓM 1: PUBLIC ROUTE (Ai cũng vào được)
          ========================================== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ai-suggest" element={<AiSuggestPage />} />
          <Route path="/heritage-gallery" element={<HeritagePage />} />

          {/* ==========================================
              NHÓM 2: PRIVATE ROUTE (Phải đăng nhập mới xem được)
              Dành cho khách du lịch (TOURIST) và cả Admin
          ========================================== */}
          {/* Note: Ở backend ông set role mặc định là "TOURIST" (viết hoa) */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "TOURIST",
                  "tourist",
                  "admin",
                  "ADMIN",
                  "superadmin",
                ]}
              />
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/check-in" element={<CheckinPage />} />
            <Route path="/voucher" element={<VoucherPage />} />
          </Route>

          {/* ==========================================
              NHÓM 3: ADMIN ROUTE (Tuyệt mật, chỉ Admin mới được vào)
          ========================================== */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin", "ADMIN", "superadmin"]} />
            }
          >
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/users" element={<AdminUserPage />} />
            <Route path="/admin/places" element={<AdminPlacePage />} />
            <Route path="/admin/reviews" element={<AdminReviewPage />} />
            <Route path="/admin/vouchers" element={<AdminVoucherPage />} />
          </Route>

          {/* Redirect và xử lý trang không tồn tại */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
