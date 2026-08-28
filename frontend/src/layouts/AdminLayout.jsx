import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function AdminLayout() {
	const navClass = ({ isActive }) => isActive ? "admin-nav-active" : undefined;
	return <><Navbar /><div className="admin-shell"><aside><Link className="brand" to="/admin/disputes"><img src="/src/assets/icon.svg" alt="Spyro Taro" /></Link><nav><NavLink className={navClass} to="/admin/disputes">Khiếu nại</NavLink><NavLink className={navClass} to="/admin/users">Người dùng</NavLink><NavLink className={navClass} to="/admin/audit-logs">Audit logs</NavLink><Link to="/account">Về ứng dụng</Link></nav></aside><main className="app-main admin-main"><Outlet /></main></div></>;
}
