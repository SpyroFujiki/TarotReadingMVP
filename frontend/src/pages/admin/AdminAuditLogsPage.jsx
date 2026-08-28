import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../../api/adminApi";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

function formatValue(value) {
  if (!value) return "-";
  try { return JSON.stringify(JSON.parse(value)); } catch { return value; }
}

export default function AdminAuditLogsPage() {
  const { data: logs = [], isLoading, isError } = useQuery({ queryKey: ["admin-audit-logs"], queryFn: () => getAuditLogs() });
  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Không thể tải audit logs." />;
  return (
    <section className="page-section">
      <p className="eyebrow">QUẢN TRỊ / AUDIT LOGS</p>
      <div className="section-heading"><h1>Nhật ký quản trị</h1><p className="lead">Lịch sử thay đổi do admin thực hiện.</p></div>
      {logs.length === 0 ? <EmptyState message="Chưa có hoạt động quản trị." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--ink)" }}>
            <thead><tr><th align="left">Thời gian</th><th align="left">Admin</th><th align="left">Hành động</th><th align="left">Đối tượng</th><th align="left">Thay đổi</th></tr></thead>
            <tbody>{logs.map((log) => <tr key={log.id} style={{ borderTop: "1px solid var(--line)" }}>
              <td style={{ padding: "14px 8px 14px 0", whiteSpace: "nowrap" }}>{new Date(log.created_at).toLocaleString("vi-VN")}</td>
              <td>{log.admin?.full_name || log.admin?.email || "-"}</td>
              <td>{log.action}</td>
              <td>{log.target_type}<br /><small>{log.target_id.slice(0, 8)}</small></td>
              <td><small>{formatValue(log.old_value)} → {formatValue(log.new_value)}</small>{log.reason && <><br /><small>Lý do: {log.reason}</small></>}</td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
