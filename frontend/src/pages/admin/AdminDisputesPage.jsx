import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { claimDispute, getAdminDisputes } from "../../api/adminApi";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { getVerdictLabel, money } from "../../utils/disputeLabels";

const labels = {
  open: "Mới mở",
  reviewing: "Đang xem xét",
};

const reasonLabels = {
  poor_quality: "Chất lượng không đạt",
  incomplete_service: "Chưa hoàn thành",
  service_not_as_described: "Khác mô tả gói",
  inappropriate_conduct: "Thái độ không phù hợp",
  other: "Lý do khác",
};

export default function AdminDisputesPage() {
  const queryClient = useQueryClient();
  const { data: disputes = [], isLoading, isError } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: getAdminDisputes,
  });
  const claimMutation = useMutation({
    mutationFn: claimDispute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-disputes"] }),
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Không thể tải hàng đợi khiếu nại." />;

  return (
    <section className="page-section">
      <p className="eyebrow">QUẢN TRỊ / KHIẾU NẠI</p>
      <div className="section-heading">
        <h1>Hàng đợi khiếu nại</h1>
        <p className="lead">Các khiếu nại đang chờ admin nhận và xử lý.</p>
      </div>
      {disputes.length === 0 ? <EmptyState message="Hiện không có khiếu nại cần xử lý." /> : (
        <div className="package-grid">
          {disputes.map((dispute) => (
            <article className="package-card" key={dispute.id}>
              <p className="card-kicker">{labels[dispute.status] || dispute.status}</p>
              <h2>{reasonLabels[dispute.reason_category] || dispute.reason_category}</h2>
              <p>{dispute.description}</p>
              <p><strong>Kết luận:</strong> {getVerdictLabel(dispute.verdict)}{dispute.refund_amount != null && ` (${money.format(dispute.refund_amount)})`}</p>
              <p><small>{new Date(dispute.created_at).toLocaleString("vi-VN")}</small></p>
              <div className="card-actions">
                <Link className="button button-small" to={`/admin/disputes/${dispute.id}`}>Xem chi tiết</Link>
                {dispute.status === "open" && (
                  <button
                    className="button button-small button-ghost"
                    disabled={claimMutation.isPending}
                    onClick={() => claimMutation.mutate(dispute.id)}
                  >
                    {claimMutation.isPending ? "Đang nhận..." : "Nhận xử lý"}
                  </button>
                )}
              </div>
              {claimMutation.isError && claimMutation.variables === dispute.id && (
                <p className="form-error">{claimMutation.error?.detail || "Không thể nhận khiếu nại."}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
