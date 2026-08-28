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

// Import các trang Khiếu nại (Disputes)
import DisputesPage from "../pages/customer/DisputesPage";
import DisputeDetailPage from "../pages/customer/DisputeDetailPage";

// Import các trang của Reader
import ReaderQueuePage from "../pages/reader/ReaderQueuePage";
import ReaderBookingsPage from "../pages/reader/ReaderBookingsPage";

import ForbiddenPage from "../pages/ForbiddenPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminDisputesPage from "../pages/admin/AdminDisputesPage";
import AdminDisputeDetailPage from "../pages/admin/AdminDisputeDetailPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminAuditLogsPage from "../pages/admin/AdminAuditLogsPage";

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
            element: <DisputesPage />,
          },
          {
            path: "/disputes/:disputeId",
            element: <DisputeDetailPage />,
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
                element: <AdminDisputesPage />,
              },
              {
                path: "/admin/disputes/:disputeId",
                element: <AdminDisputeDetailPage />,
              },
              {
                path: "/admin/users",
                element: <AdminUsersPage />,
              },
              {
                path: "/admin/audit-logs",
                element: <AdminAuditLogsPage />,
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