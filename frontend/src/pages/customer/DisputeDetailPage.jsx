import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDisputeDetail, getDisputeMessages, sendDisputeMessage } from "../../api/disputeApi";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { getVerdictLabel, money } from "../../utils/disputeLabels";

const categoryMap = {
  poor_quality: "Chất lượng không đạt yêu cầu",
  incomplete_service: "Chưa hoàn thành lượt trải bài",
  service_not_as_described: "Khác mô tả gói dịch vụ",
  inappropriate_conduct: "Thái độ không phù hợp",
  other: "Lý do khác",
};

export default function DisputeDetailPage() {
  const { disputeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [inputMsg, setInputMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const chatBottomRef = useRef(null);

  const {
    data: dispute,
    isLoading: isDisputeLoading,
    isError: isDisputeError,
  } = useQuery({
    queryKey: ["dispute-detail", disputeId],
    queryFn: () => getDisputeDetail(disputeId),
    enabled: !!disputeId,
    refetchInterval: 3000,
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["dispute-messages", disputeId],
    queryFn: () => getDisputeMessages(disputeId),
    enabled: !!disputeId,
    refetchInterval: 2000,
  });

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (content) => sendDisputeMessage(disputeId, { content }),
    onSuccess: () => {
      setInputMsg("");
      setErrorMsg("");
      queryClient.invalidateQueries({ queryKey: ["dispute-messages", disputeId] });
    },
    onError: (err) => {
      const detail = err?.detail || err?.response?.data?.detail;
      setErrorMsg(typeof detail === "string" ? detail : "Không thể gửi tin nhắn lúc này.");
    },
  });

  if (isDisputeLoading) return <LoadingState />;
  if (isDisputeError || !dispute) {
    return <EmptyState message="Không tìm thấy đơn khiếu nại này." />;
  }

  const isClosed = ["resolved", "rejected"].includes(dispute.status?.toLowerCase());

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || sendMutation.isPending || isClosed) return;
    setErrorMsg("");
    sendMutation.mutate(inputMsg.trim());
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return { text: "✦ Đã giải quyết", bg: "rgba(34, 197, 94, 0.12)", color: "#4ade80", border: "#22c55e" };
      case "in_review":
      case "open":
      case "pending":
        return { text: "⚖️ Đang trao đổi", bg: "rgba(239, 68, 68, 0.12)", color: "#fca5a5", border: "#ef4444" };
      case "rejected":
        return { text: "✕ Đã từ chối", bg: "rgba(148, 163, 184, 0.12)", color: "#cbd5e1", border: "#64748b" };
      default:
        return { text: status?.toUpperCase() || "MỞ", bg: "rgba(250, 204, 21, 0.12)", color: "#fde047", border: "#facc15" };
    }
  };

  const getSenderTag = (msg) => {
    const isMe = msg.sender_id === user?.id;
    if (isMe) return { label: "Bạn", color: "#facc15" };
    if (msg.sender_role === "admin" || (!msg.sender_role && msg.sender_id === dispute.admin_id)) {
      return { label: "Ban Quản Trị", color: "#f87171" };
    }
    if (msg.sender_id === dispute.raised_by_id) {
      return { label: "Khách hàng", color: "#60a5fa" };
    }
    return { label: "Tarot Reader", color: "#c084fc" };
  };

  const badge = getStatusBadge(dispute.status);
  const shortId = dispute.id ? dispute.id.slice(0, 8).toUpperCase() : "";
  const shortBookingId = dispute.booking_id ? dispute.booking_id.slice(0, 8).toUpperCase() : "";
  const categoryLabel = categoryMap[dispute.reason_category] || dispute.reason_category || "Khiếu nại dịch vụ";
  const verdictLabel = getVerdictLabel(dispute.verdict);

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px 24px 70px" }}>
      {/* Quay lại */}
      <button
        onClick={() => navigate("/disputes")}
        style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: "500",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "16px",
          padding: 0,
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#facc15")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
      >
        ← Danh sách khiếu nại
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "18px",
          marginBottom: "26px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1
              className="font-tarot"
              style={{
                fontSize: "2.4rem",
                color: "#ffffff",
                margin: 0,
                fontWeight: "400",
                lineHeight: 1.1,
              }}
            >
              Đơn Khiếu Nại
            </h1>
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#facc15",
                backgroundColor: "rgba(250, 204, 21, 0.1)",
                border: "1px solid rgba(250, 204, 21, 0.25)",
                padding: "3px 10px",
                borderRadius: "8px",
                letterSpacing: "0.5px",
                fontVariantNumeric: "lining-nums tabular-nums",
              }}
            >
              #{shortId}
            </span>
          </div>

          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Đơn trải bài:</span>
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                color: "#cbd5e1",
                fontWeight: "600",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                padding: "1px 6px",
                borderRadius: "4px",
              }}
            >
              #{shortBookingId}
            </span>
            <span>•</span>
            <span>{new Date(dispute.created_at).toLocaleString("vi-VN")}</span>
          </div>
        </div>

        <div
          style={{
            padding: "8px 18px",
            borderRadius: "20px",
            backgroundColor: badge.bg,
            border: `1px solid ${badge.border}`,
            color: badge.color,
            fontSize: "0.85rem",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: badge.color }} />
          {badge.text}
        </div>
      </div>

      {/* 2 Cột */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* CỘT TRÁI */}
        <div
          style={{
            backgroundColor: "#061325",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "22px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              Lý do khiếu nại
            </span>
            <div style={{ fontSize: "0.9rem", color: "#facc15", fontWeight: "600" }}>
              {categoryLabel}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              Nội dung chi tiết
            </span>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "#e2e8f0",
                fontSize: "0.92rem",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {dispute.description || dispute.reason || "Không có nội dung mô tả."}
            </div>
          </div>

          {dispute.resolution_note && (
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#4ade80", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                ✦ Kết luận từ Ban Quản Trị
              </span>
              <div
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  color: "#bbf7d0",
                  fontSize: "0.88rem",
                  lineHeight: "1.5",
                }}
              >
                {dispute.resolution_note}
              </div>
            </div>
          )}

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              Kết luận
            </span>
            <div style={{ color: dispute.verdict ? "#4ade80" : "#94a3b8", fontWeight: "700" }}>
              {verdictLabel}
              {dispute.refund_amount != null && <span style={{ color: "#facc15", marginLeft: "8px" }}>{money.format(dispute.refund_amount)}</span>}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "10px",
              padding: "12px 14px",
              fontSize: "0.82rem",
              color: "#64748b",
              lineHeight: "1.5",
            }}
          >
            Mọi trao đổi tại đây được lưu trữ để đảm bảo quyền lợi công bằng cho cả hai bên.
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG ĐỐI THOẠI */}
        <div
          style={{
            backgroundColor: "#061325",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            height: "580px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              paddingBottom: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#ffffff" }}>
              Kênh Trao Đổi Trực Tiếp
            </div>
            <div style={{ fontSize: "0.8rem", color: isClosed ? "#94a3b8" : "#4ade80", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: isClosed ? "#94a3b8" : "#4ade80" }} />
              {isClosed ? "Phiên đối thoại đã kết thúc" : "Đang kết nối"}
            </div>
          </div>

          {/* Tin nhắn */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              paddingRight: "8px",
              marginBottom: "16px",
            }}
          >
            {isMessagesLoading ? (
              <div style={{ textAlign: "center", color: "#64748b", margin: "auto", fontSize: "0.9rem" }}>
                Đang tải tin nhắn...
              </div>
            ) : !messages || messages.length === 0 ? (
              <div style={{ textAlign: "center", margin: "auto", color: "#64748b" }}>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>Chưa có trao đổi nào. Bạn có thể gửi phản hồi tại đây.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                const sender = getSenderTag(msg);

                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <span style={{ fontSize: "0.72rem", color: sender.color, fontWeight: "600", marginBottom: "3px" }}>
                      {sender.label}
                    </span>
                    <div
                      style={{
                        backgroundColor: isMe ? "#1e293b" : "#0d1b2a",
                        color: isMe ? "#f8fafc" : "#e2e8f0",
                        border: isMe ? "1px solid #334155" : "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "10px 14px",
                        borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        fontSize: "0.92rem",
                        lineHeight: "1.5",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#475569",
                        marginTop: "3px",
                        fontFamily: "ui-monospace, monospace",
                      }}
                    >
                      {new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {errorMsg && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                marginBottom: "10px",
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Form chat hoặc Khóa chat */}
          {isClosed ? (
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                padding: "12px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "0.88rem",
              }}
            >
              🔒 Hồ sơ khiếu nại đã đóng. Không thể gửi thêm phản hồi.
            </div>
          ) : (
            <form onSubmit={handleSend} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Nhập nội dung phản hồi..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={sendMutation.isPending}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backgroundColor: "#030712",
                  color: "#ffffff",
                  fontSize: "0.92rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={sendMutation.isPending || !inputMsg.trim()}
                style={{
                  padding: "11px 22px",
                  backgroundColor: "#facc15",
                  color: "#001f3f",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  cursor: sendMutation.isPending || !inputMsg.trim() ? "not-allowed" : "pointer",
                  opacity: sendMutation.isPending || !inputMsg.trim() ? 0.5 : 1,
                }}
              >
                {sendMutation.isPending ? "..." : "Gửi"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}