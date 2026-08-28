import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? "#facc15" : "#cbd5e1",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: isActive ? "700" : "500",
    transition: "color 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    borderBottom: isActive ? "2px solid #facc15" : "2px solid transparent",
    paddingBottom: "4px",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#001326", color: "#ffffff", display: "flex", flexDirection: "column" }}>
      {/* Header / Navbar */}
      <header
        style={{
          borderBottom: "1px solid rgba(250, 204, 21, 0.2)",
          backgroundColor: "rgba(0, 19, 38, 0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <NavLink to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="font-tarot" style={{ fontSize: "1.6rem", color: "#facc15", fontWeight: "700", letterSpacing: "1.5px" }}>
              LÁ BÀI <span style={{ color: "#ffffff", fontWeight: "300" }}>TAROT</span>
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {/* Customer Links */}
            {user?.role === "customer" && (
              <>
                <NavLink to="/packages" style={navLinkStyle}>
                  Dịch vụ
                </NavLink>
                <NavLink to="/bookings" style={navLinkStyle}>
                  Booking của tôi
                </NavLink>
                <NavLink to="/disputes" style={navLinkStyle}>
                  Khiếu nại
                </NavLink>
              </>
            )}

            {/* Reader Links */}
            {user?.role === "reader" && (
              <>
                <NavLink to="/reader/queue" style={navLinkStyle}>
                  ⏳ Hàng đợi Reader
                </NavLink>
                <NavLink to="/reader/bookings" style={navLinkStyle}>
                  🔮 Đơn đang phụ trách
                </NavLink>
                <NavLink to="/disputes" style={navLinkStyle}>
                  ⚖️ Khiếu nại
                </NavLink>
              </>
            )}

            {/* Admin Links */}
            {user?.role === "admin" && (
              <>
                <NavLink to="/admin/disputes" style={navLinkStyle}>
                  ⚖️ Xử lý tranh chấp
                </NavLink>
                <NavLink to="/admin/users" style={navLinkStyle}>
                  👥 Người dùng
                </NavLink>
              </>
            )}

            <NavLink to="/account" style={navLinkStyle}>
              Tài khoản ({user?.full_name || user?.email?.split("@")[0] || "Bạn"})
            </NavLink>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 18px",
                backgroundColor: "transparent",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.borderColor = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
              }}
            >
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}