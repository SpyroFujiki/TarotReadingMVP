import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const roleLabels = { customer: "Khách hàng", reader: "Tarot Reader", admin: "Quản trị viên" };
const statusLabels = { active: "Đang hoạt động", suspend: "Tạm khóa", banned: "Đã khóa" };

function getInitials(name = "Bạn") {
  return name.split(" ").filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();
}

export default function AccountPage() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Bạn";
  const role = roleLabels[user?.role] || user?.role || "Chưa xác định";
  const status = statusLabels[user?.status] || user?.status || "Chưa xác định";

  return (
    <section className="page-section account-page">
      <div className="account-hero">
        <div className="account-avatar">{getInitials(displayName)}</div>
        <div>
          <p className="eyebrow">HỒ SƠ CÁ NHÂN</p>
          <h1>Xin chào, {displayName}.</h1>
          <p className="lead">Quản lý thông tin tài khoản và truy cập nhanh vào không gian của bạn.</p>
        </div>
      </div>

      <div className="account-content-grid">
        <div className="account-panel">
          <div className="account-panel-heading"><span className="card-kicker">THÔNG TIN TÀI KHOẢN</span><span className="account-status">{status}</span></div>
          <dl className="account-details">
            <div><dt>Họ và tên</dt><dd>{displayName}</dd></div>
            <div><dt>Email</dt><dd>{user?.email || "-"}</dd></div>
            <div><dt>Vai trò</dt><dd>{role}</dd></div>
            <div><dt>Trạng thái</dt><dd>{status}</dd></div>
          </dl>
        </div>

        <div className="account-panel account-actions-panel">
          <span className="card-kicker">KHÔNG GIAN CỦA BẠN</span>
          <h2 className="font-tarot">Tiếp tục hành trình</h2>
          {user?.role === "customer" && <>
            <Link className="account-action-link" to="/packages">Khám phá gói trải bài <span>→</span></Link>
            <Link className="account-action-link" to="/bookings">Xem booking của tôi <span>→</span></Link>
            <Link className="account-action-link" to="/disputes">Theo dõi khiếu nại <span>→</span></Link>
          </>}
          {user?.role === "reader" && <>
            <Link className="account-action-link" to="/reader/queue">Mở hàng đợi Reader <span>→</span></Link>
            <Link className="account-action-link" to="/reader/bookings">Đơn đang phụ trách <span>→</span></Link>
            <Link className="account-action-link" to="/disputes">Theo dõi khiếu nại <span>→</span></Link>
          </>}
          {user?.role === "admin" && <>
            <Link className="account-action-link" to="/admin/disputes">Xử lý khiếu nại <span>→</span></Link>
            <Link className="account-action-link" to="/admin/users">Quản lý người dùng <span>→</span></Link>
            <Link className="account-action-link" to="/admin/audit-logs">Xem audit logs <span>→</span></Link>
          </>}
        </div>
      </div>
    </section>
  );
}
