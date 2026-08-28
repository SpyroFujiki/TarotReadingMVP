import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMyDisputes } from "../../api/disputeApi";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

const categoryMap = {
  poor_quality: "Chất lượng không đạt yêu cầu",
  incomplete_service: "Chưa hoàn thành lượt trải bài",
  service_not_as_described: "Khác mô tả gói dịch vụ",
  inappropriate_conduct: "Thái độ không phù hợp",
  other: "Lý do khác",
};

export default function DisputesPage() {
  const navigate = useNavigate();

  const {
    data: disputes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-disputes"],
    queryFn: getMyDisputes,
    refetchInterval: 4000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Không thể tải danh sách khiếu nại lúc này." />;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return { text: "Đã giải quyết", bg: "rgba(34, 197, 94, 0.12)", color: "#4ade80", border: "#22c55e" };
      case "in_review":
      case "open":
      case "pending":
        return { text: "Đang trao đổi", bg: "rgba(239, 68, 68, 0.12)", color: "#fca5a5", border: "#ef4444" };
      case "rejected":
        return { text: "Đã từ chối", bg: "rgba(148, 163, 184, 0.12)", color: "#cbd5e1", border: "#64748b" };
      default:
        return { text: status || "Mở", bg: "rgba(250, 204, 21, 0.12)", color: "#fde047", border: "#facc15" };
    }
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "36px 24px 80px" }}>
      {/* Header gọn gàng */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "28px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "18px",
        }}
      >
        <div>
          <h1
            className="font-tarot"
            style={{
              fontSize: "2.6rem",
              color: "#facc15",
              margin: 0,
              lineHeight: 1.1,
              fontWeight: "400",
              letterSpacing: "0.5px",
            }}
          >
            Khiếu Nại & Tranh Chấp
          </h1>
          <span style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "6px", display: "inline-block" }}>
            Tổng cộng: <strong style={{ color: "#e2e8f0" }}>{disputes?.length || 0}</strong> đơn khiếu nại
          </span>
        </div>
      </div>

      {!disputes || disputes.length === 0 ? (
        <div
          style={{
            backgroundColor: "#061325",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "60px 40px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.4rem", marginBottom: "12px" }}>🌿</div>
          <h2 className="font-tarot" style={{ color: "#ffffff", fontSize: "1.8rem", margin: "0 0 8px 0", fontWeight: "400" }}>
            Không có khiếu nại nào
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
            Tất cả các phiên trải bài của bạn đều đang diễn ra thuận lợi.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {disputes.map((item) => {
            const statusInfo = getStatusBadge(item.status);
            const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "";
            const shortDisputeId = item.id ? item.id.slice(0, 8).toUpperCase() : "";
            const shortBookingId = item.booking_id ? item.booking_id.slice(0, 8).toUpperCase() : "";
            const categoryText = categoryMap[item.reason_category] || item.reason_category || "Khiếu nại dịch vụ";
            const detailText = item.description || item.reason || "(Chưa có nội dung mô tả)";

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#061325",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "22px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
                  gap: "24px",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        padding: "3px 10px",
                        borderRadius: "16px",
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.border}`,
                      }}
                    >
                      {statusInfo.text}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      Mã khiếu nại:{" "}
                      <strong
                        style={{
                          fontFamily: "ui-monospace, monospace",
                          color: "#cbd5e1",
                          fontVariantNumeric: "lining-nums tabular-nums",
                        }}
                      >
                        #{shortDisputeId}
                      </strong>{" "}
                      {dateStr && `• ${dateStr}`}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        color: "#94a3b8",
                      }}
                    >
                      ✦ {categoryText}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.25rem",
                      color: "#ffffff",
                      margin: "0 0 6px 0",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>Phiên trải bài</span>
                    <span
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        color: "#facc15",
                        fontWeight: "700",
                        fontVariantNumeric: "lining-nums tabular-nums",
                      }}
                    >
                      #{shortBookingId}
                    </span>
                  </h3>

                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "#94a3b8",
                      margin: 0,
                      lineHeight: "1.5",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    Nội dung: <span style={{ color: "#e2e8f0" }}>"{detailText}"</span>
                  </p>
                </div>

                <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.06)", paddingLeft: "24px", flexShrink: 0 }}>
                  <button
                    onClick={() => navigate(`/disputes/${item.id}`)}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#facc15",
                      color: "#001f3f",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 3px 12px rgba(250, 204, 21, 0.25)",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    Vào phòng xử lý →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}