import { Link, Outlet } from "react-router-dom";

export function AdminLayout() {
	return <div className="admin-shell"><aside><Link className="brand" to="/admin/disputes">LÁ BÀI <span>quản trị</span></Link><nav><Link to="/admin/disputes">Khiếu nại</Link><Link to="/admin/users">Người dùng</Link><Link to="/admin/audit-logs">Audit logs</Link><Link to="/account">Về ứng dụng</Link></nav></aside><main className="app-main admin-main"><Outlet /></main></div>;
}
