import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { AppLayout } from "../layouts/AppLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { RoleRoute } from "../guards/RoleRoute";

import HomePage from "../pages/public/HomePage";
import PackagesPage from "../pages/public/PackagesPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import AccountPage from "../pages/AccountPage";
import MyBookingsPage from "../pages/customer/MyBookingsPage";
import NewBookingPage from "../pages/customer/NewBookingPage";
import BookingDetailPage from "../pages/customer/BookingDetailPage";

// Import 2 trang thật của Reader
import ReaderQueuePage from "../pages/reader/ReaderQueuePage";
import ReaderBookingsPage from "../pages/reader/ReaderBookingsPage";

import AppPlaceholder from "../pages/AppPlaceholder";
import ForbiddenPage from "../pages/ForbiddenPage";
import NotFoundPage from "../pages/NotFoundPage";

const placeholder = (title, description, action, to) => (
  <AppPlaceholder title={title} description={description} action={action} to={to} />
);

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/packages", element: <PackagesPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/account", element: <AccountPage /> },
          { path: "/bookings", element: <MyBookingsPage /> },
          { path: "/bookings/new", element: <NewBookingPage /> },
          {
            path: "/bookings/:bookingId",
            element: <BookingDetailPage />,
          },
          {
            path: "/disputes",
            element: placeholder(
              "Khiếu nại",
              "Theo dõi các khiếu nại liên quan đến phiên đọc."
            ),
          },
          {
            path: "/disputes/:disputeId",
            element: placeholder(
              "Chi tiết khiếu nại",
              "Trao đổi và theo dõi kết quả xử lý khiếu nại.",
              "Về danh sách",
              "/disputes"
            ),
          },
        ],
      },
      {
        element: <RoleRoute minimumRole="reader" />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: "/reader/queue",
                element: <ReaderQueuePage />,
              },
              {
                path: "/reader/bookings",
                element: <ReaderBookingsPage />,
              },
            ],
          },
        ],
      },
      {
        element: <RoleRoute minimumRole="admin" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: "/admin/disputes",
                element: placeholder(
                  "Hàng đợi khiếu nại",
                  "Xem xét các khiếu nại đang mở."
                ),
              },
              {
                path: "/admin/disputes/:disputeId",
                element: placeholder(
                  "Xử lý khiếu nại",
                  "Trao đổi, nhận và giải quyết khiếu nại."
                ),
              },
              {
                path: "/admin/users",
                element: placeholder(
                  "Quản lý người dùng",
                  "Theo dõi vai trò và trạng thái tài khoản."
                ),
              },
              {
                path: "/admin/audit-logs",
                element: placeholder(
                  "Nhật ký quản trị",
                  "Lịch sử các thao tác quản trị trong hệ thống."
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "/403", element: <ForbiddenPage /> },
  { path: "*", element: <NotFoundPage /> },
]);