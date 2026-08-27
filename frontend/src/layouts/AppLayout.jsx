import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  const isReader = user?.role === "reader";
  const isAdmin = user?.role === "admin";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#001f3f", color: "#ffffff" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgba(0, 31, 63, 0.95)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: "700",
              letterSpacing: "2px",
              color: "#ffffff",
              textTransform: "uppercase",
            }}
          >
            LÁ BÀI <span style={{ color: "#facc15", fontWeight: "300" }}>Tarot</span>
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {isReader ? (
            <>
              <Link to="/reader/queue" style={{ color: "#facc15", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600" }}>
                ⏳ Hàng đợi Reader
              </Link>
              <Link to="/reader/bookings" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600" }}>
                🔮 Đơn đang phụ trách
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link to="/admin/disputes" style={{ color: "#facc15", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600" }}>
                Hàng đợi khiếu nại
              </Link>
              <Link to="/admin/users" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "0.95rem" }}>
                Quản lý User
              </Link>
              <Link to="/admin/audit-logs" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "0.95rem" }}>
                Nhật ký
              </Link>
            </>
          ) : (
            <>
              <Link to="/" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "0.95rem" }}>
                Trang chủ
              </Link>
              <Link to="/packages" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "0.95rem" }}>
                Dịch vụ
              </Link>
              <Link to="/bookings" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "0.95rem" }}>
                Booking của tôi
              </Link>
              <Link to="/disputes" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "0.95rem" }}>
                Khiếu nại
              </Link>
            </>
          )}

          <Link to="/account" style={{ color: "#facc15", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600" }}>
            Tài khoản ({user?.name || "Bạn"})
          </Link>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Đăng xuất
          </button>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}