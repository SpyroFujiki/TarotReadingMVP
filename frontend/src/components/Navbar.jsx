import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/icon.svg";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "#facc15" : "#cbd5e1",
  textDecoration: "none",
  fontSize: "0.92rem",
  fontWeight: isActive ? "700" : "500",
  transition: "color 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  borderBottom: isActive ? "2px solid #facc15" : "2px solid transparent",
  paddingBottom: "4px",
});

const logoutStyle = {
  padding: "8px 18px",
  backgroundColor: "transparent",
  color: "#f87171",
  border: "1px solid rgba(239, 68, 68, 0.4)",
  borderRadius: "8px",
  fontSize: "0.88rem",
  fontWeight: "600",
};

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Bạn";

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <header className="shared-navbar">
      <div className="shared-navbar-inner">
        <NavLink to="/" className="shared-navbar-brand" aria-label="Spyro Taro">
          <img src={logo} alt="Spyro Taro" />
        </NavLink>
        <nav className="shared-navbar-links">
          <NavLink to="/" style={linkStyle}>Trang chủ</NavLink>
          {!isAuthenticated && <>
            <NavLink to="/packages" style={linkStyle}>Dịch vụ</NavLink>
            <NavLink to="/login" style={linkStyle}>Đăng nhập</NavLink>
            <NavLink className="shared-navbar-register" to="/register">Đăng ký</NavLink>
          </>}
          {user?.role === "customer" && <>
            <NavLink to="/packages" style={linkStyle}>Dịch vụ</NavLink>
            <NavLink to="/bookings" style={linkStyle}>Đơn trải bài của tôi</NavLink>
            <NavLink to="/disputes" style={linkStyle}>Khiếu nại</NavLink>
          </>}
          {user?.role === "reader" && <>
            <NavLink to="/reader/queue" style={linkStyle}> Hàng đợi Reader</NavLink>
            <NavLink to="/reader/bookings" style={linkStyle}> Đơn đang phụ trách</NavLink>
            <NavLink to="/disputes" style={linkStyle}> Khiếu nại</NavLink>
          </>}
          {user?.role === "admin" && <>
            <NavLink to="/admin/disputes" style={linkStyle}> Xử lý tranh chấp</NavLink>
            <NavLink to="/admin/users" style={linkStyle}> Người dùng</NavLink>
            <NavLink to="/admin/audit-logs" style={linkStyle}>Nhật ký</NavLink>
          </>}
          {isAuthenticated && <>
            <NavLink to="/account" style={linkStyle}>Tài khoản ({displayName})</NavLink>
            <button type="button" style={logoutStyle} onClick={handleLogout}>Đăng xuất</button>
          </>}
        </nav>
      </div>
    </header>
  );
}
