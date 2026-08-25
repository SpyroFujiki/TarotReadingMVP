import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppLayout() {
	const { user, signOut } = useAuth();
	const navigate = useNavigate();
	return <><header className="site-header app-header"><Link className="brand" to="/account">LÁ BÀI <span>tarot reading</span></Link><nav><Link to="/bookings">Booking</Link><Link to="/disputes">Khiếu nại</Link>{user?.role !== "customer" && <Link to="/reader/queue">Reader</Link>}{user?.role === "admin" && <Link to="/admin/disputes">Admin</Link>}<button className="button button-ghost" onClick={() => { signOut(); navigate("/login"); }}>Đăng xuất</button></nav></header><main className="app-main"><Outlet /></main></>;
}
