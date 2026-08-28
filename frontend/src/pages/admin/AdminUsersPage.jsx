import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, updateUserRole, updateUserStatus } from "../../api/adminApi";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: getAdminUsers });
  const mutation = useMutation({
    mutationFn: ({ userId, type, value }) => type === "role" ? updateUserRole(userId, value) : updateUserStatus(userId, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  if (usersQuery.isLoading) return <LoadingState />;
  if (usersQuery.isError) return <EmptyState message="Không thể tải danh sách người dùng." />;
  const users = usersQuery.data || [];

  return (
    <section className="page-section">
      <p className="eyebrow">QUẢN TRỊ / NGƯỜI DÙNG</p>
      <div className="section-heading"><h1>Quản lý người dùng</h1><p className="lead">Cập nhật vai trò và trạng thái tài khoản.</p></div>
      {mutation.isError && <p className="form-error">{mutation.error?.detail || "Không thể cập nhật người dùng."}</p>}
      {users.length === 0 ? <EmptyState message="Chưa có người dùng." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--ink)" }}>
            <thead><tr><th align="left">Người dùng</th><th align="left">Vai trò</th><th align="left">Trạng thái</th><th align="left">Thao tác</th></tr></thead>
            <tbody>{users.map((item) => {
              const isSelf = item.id === user?.id;
              return <tr key={item.id} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "16px 8px 16px 0" }}><strong>{item.full_name}</strong><br /><small>{item.email}</small></td>
                <td><select disabled={isSelf || mutation.isPending} value={item.role} onChange={(event) => mutation.mutate({ userId: item.id, type: "role", value: event.target.value })}><option value="customer">Customer</option><option value="reader">Reader</option><option value="admin">Admin</option></select></td>
                <td><select disabled={isSelf || mutation.isPending} value={item.status} onChange={(event) => mutation.mutate({ userId: item.id, type: "status", value: event.target.value })}><option value="active">Active</option><option value="suspend">Suspend</option><option value="banned">Banned</option></select></td>
                <td>{isSelf ? <small>Tài khoản của bạn</small> : <small>{new Date(item.created_at).toLocaleDateString("vi-VN")}</small>}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
