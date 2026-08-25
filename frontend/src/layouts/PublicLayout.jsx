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

	return <><header className="site-header"><Link className="brand" to="/"><img src={logo} alt="Spyro Taro" /></Link><nav><Link to="/">Trang chủ</Link><Link to="/packages">Dịch vụ</Link>{user ? <><Link to="/account">Tài khoản</Link><button className="nav-action" onClick={() => { signOut(); navigate("/"); }}>Đăng xuất</button></> : <Link className="nav-cta" to="/login">Đăng nhập / Đăng ký</Link>}</nav></header><main className="public-main"><Outlet /></main><footer className="site-footer"><div className="footer-inner"><div><Link className="footer-brand" to="/"><img src={logo} alt="Spyro Taro" /></Link><p>Gỡ rối hiện tại — Mở lối tương lai.</p></div><div className="footer-links"><strong>Khám phá</strong><Link to="/packages">Các gói dịch vụ</Link><Link to="/login">Đăng nhập / Đăng ký</Link></div><div className="footer-links"><strong>Tarot Reading MVP</strong><span>Không gian kết nối khách hàng và reader.</span><span>© 2026 Spyro Taro</span></div></div></footer>{showScrollTop && <button className="scroll-top" aria-label="Cuộn lên đầu trang" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>}</>;
}
