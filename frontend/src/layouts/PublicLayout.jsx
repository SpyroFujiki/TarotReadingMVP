import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/icon.svg";
import { useAuth } from "../contexts/AuthContext";

export function PublicLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 1. THANH HEADER (Giữ nguyên class của bạn) */}
      <header className="site-header">
        <Link className="brand" to="/">
          <img src={logo} alt="Spyro Taro" />
        </Link>
        <nav>
          <Link to="/">Trang chủ</Link>
          <Link to="/packages">Dịch vụ</Link>
          {!user ? (
            <Link className="nav-cta" to="/login">Đăng nhập / Đăng ký</Link>
          ) : (
            <button className="nav-action" onClick={signOut}>Đăng xuất</button>
          )}
        </nav>
      </header>

      {/* 2. PHẦN NỘI DUNG CHÍNH (Outlet sẽ hiển thị HomePage, PackagesPage...) */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* 3. CHÂN TRANG (FOOTER) */}
      <footer style={{ 
        borderTop: "1px solid rgba(255, 215, 0, 0.2)", 
        padding: "60px 20px", 
        margin: "80px auto 0", 
        maxWidth: "1400px", /* Nới rộng từ 1100px lên 1400px */
        display: "flex",
        justifyContent: "space-between", 
        flexWrap: "wrap",
        gap: "40px"
      }}>
        {/* Cột 1 */}
        <div style={{ maxWidth: "300px" }}>
          <img src={logo} alt="Logo" style={{ width: "90px", marginBottom: "20px" }} />
          <p style={{ fontSize: "1.15rem", color: "#cccccc", lineHeight: "1.6" }}>
            Gỡ rối hiện tại — Mở lối tương lai.
          </p>
        </div>
        
        {/* Cột 2 */}
        <div>
          <h4 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ffd700", marginBottom: "25px" }}>
            Khám phá
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "1.15rem", color: "#cccccc", lineHeight: "2.2" }}>
            <li><Link to="/packages" style={{ color: "inherit", textDecoration: "none" }}>Các gói dịch vụ</Link></li>
            <li><Link to="/login" style={{ color: "inherit", textDecoration: "none" }}>Đăng nhập / Đăng ký</Link></li>
          </ul>
        </div>

        {/* Cột 3 */}
        <div>
          <h4 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ffd700", marginBottom: "25px" }}>
            Tarot Reading MVP
          </h4>
          <p style={{ fontSize: "1.15rem", color: "#cccccc", marginBottom: "20px" }}>
            Không gian kết nối khách hàng và reader.
          </p>
          <p style={{ fontSize: "1.05rem", color: "#888888" }}>
            © 2026 Spyro Taro
          </p>
        </div>
      </footer>

      {/* Nút cuộn lên đầu trang (Giữ nguyên logic của bạn) */}
      {showScrollTop && (
        <button 
          className="scroll-top" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}
    </>
  );
}