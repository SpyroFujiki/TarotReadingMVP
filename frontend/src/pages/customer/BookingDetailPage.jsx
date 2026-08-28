import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookingDetail, startBooking, completeBooking } from "../../api/bookingApi";
import { getServiceMessages, sendServiceMessage } from "../../api/serviceMessageApi";
import { createDispute, getMyDisputes } from "../../api/disputeApi";
import { getPackages } from "../../api/packageApi";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

const cardAssets = import.meta.glob("../../assets/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
  query: "?url",
});

const tarotCards = Object.entries(cardAssets)
  .filter(([path]) => /(?:The|Cups|Wands|Swords|Pentacles)/.test(path))
  .map(([, source]) => source);

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const parseApiError = (err) => {
  const detail = err?.detail || err?.response?.data?.detail;
  const translateValidationMessage = (message) => {
    if (/at least 10 characters/i.test(message)) {
      return "Mô tả khiếu nại cần có ít nhất 10 ký tự.";
    }
    if (/at most 2000 characters/i.test(message)) {
      return "Mô tả khiếu nại không được vượt quá 2000 ký tự.";
    }
    return message;
  };
  if (typeof detail === "string") return translateValidationMessage(detail);
  if (Array.isArray(detail) && detail.length > 0) {
    return translateValidationMessage(detail[0]?.msg || JSON.stringify(detail[0]));
  }
  if (typeof detail === "object" && detail !== null) {
    return translateValidationMessage(detail?.msg || JSON.stringify(detail));
  }
  return err?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
};

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [messageInput, setMessageInput] = useState("");
  const [chatError, setChatError] = useState("");

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [reasonCategory, setReasonCategory] = useState("poor_quality");
  const [description, setDescription] = useState("");
  const [disputeError, setDisputeError] = useState("");

  const chatBottomRef = useRef(null);

  // Chi tiết Booking
  const {
    data: booking,
    isLoading: isBookingLoading,
    isError: isBookingError,
  } = useQuery({
    queryKey: ["booking-detail", bookingId],
    queryFn: () => getBookingDetail(bookingId),
    enabled: !!bookingId,
    refetchInterval: 3000,
  });

  // Gói bài
  const { data: packages } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
  });

  // Tin nhắn dịch vụ
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["service-messages", bookingId],
    queryFn: () => getServiceMessages(bookingId),
    enabled: !!bookingId,
    refetchInterval: 2500,
  });

  // Danh sách khiếu nại để liên kết nút xem nhanh
  const { data: disputes } = useQuery({
    queryKey: ["my-disputes"],
    queryFn: getMyDisputes,
    enabled: !!bookingId,
  });

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (content) => sendServiceMessage(bookingId, { content }),
    onSuccess: () => {
      setMessageInput("");
      setChatError("");
      queryClient.invalidateQueries({ queryKey: ["service-messages", bookingId] });
    },
    onError: (err) => setChatError(parseApiError(err)),
  });

  const startMutation = useMutation({
    mutationFn: () => startBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["assigned-bookings"] });
    },
    onError: (err) => alert(parseApiError(err)),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["assigned-bookings"] });
    },
    onError: (err) => alert(parseApiError(err)),
  });

  const disputeMutation = useMutation({
    mutationFn: (payload) => createDispute(bookingId, payload),
    onSuccess: (res) => {
      setShowDisputeModal(false);
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["my-disputes"] });
      if (res?.id) {
        navigate(`/disputes/${res.id}`);
      } else {
        navigate("/disputes");
      }
    },
    onError: (err) => setDisputeError(parseApiError(err)),
  });

  if (isBookingLoading) return <LoadingState />;
  if (isBookingError || !booking) {
    return <EmptyState message="Không tìm thấy thông tin phiên trải bài này." />;
  }

  const isReader = user?.role === "reader" || booking.reader_id === user?.id;
  const isCustomer = !isReader && booking.customer_id === user?.id;
  const statusLower = booking?.status?.toLowerCase();
  const isDisputing = statusLower === "disputing" || statusLower === "disputed";
  const isCompleted = statusLower === "completed";

  // Tìm dispute liên quan đến booking này nếu có
  const relatedDispute = disputes?.find((d) => d.booking_id === booking.id);

  const currentPkg = packages?.find((p) => p.id === booking.package_id);
  const pkgIndex = packages?.findIndex((p) => p.id === currentPkg?.id) ?? 0;
  const cardImg = tarotCards.length > 0 ? tarotCards[Math.max(0, pkgIndex) % tarotCards.length] : null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sendMessageMutation.isPending) return;
    setChatError("");
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleOpenDisputeModal = () => {
    setDisputeError("");
    setDescription("");
    setShowDisputeModal(true);
  };

  const handleSubmitDispute = (e) => {
    e.preventDefault();
    const trimmedDescription = description.trim();
    if (disputeMutation.isPending) return;
    if (trimmedDescription.length < 10) {
      setDisputeError("Mô tả khiếu nại cần có ít nhất 10 ký tự.");
      return;
    }
    if (trimmedDescription.length > 2000) {
      setDisputeError("Mô tả khiếu nại không được vượt quá 2000 ký tự.");
      return;
    }
    setDisputeError("");
    disputeMutation.mutate({
      reason_category: reasonCategory,
      description: trimmedDescription,
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { text: "✦ Đã Hoàn Thành", bg: "rgba(34, 197, 94, 0.15)", border: "#22c55e", color: "#4ade80" };
      case "in_progress":
        return { text: "🔮 Đang Trải Bài", bg: "rgba(168, 85, 247, 0.2)", border: "#a855f7", color: "#d8b4fe" };
      case "assigned":
        return { text: "👤 Reader Đã Nhận Đơn", bg: "rgba(59, 130, 246, 0.2)", border: "#3b82f6", color: "#93c5fd" };
      case "disputing":
      case "disputed":
        return { text: "⚠ Đang Khiếu Nại", bg: "rgba(239, 68, 68, 0.2)", border: "#ef4444", color: "#fca5a5" };
      default:
        return { text: "⏳ Đang Chờ Reader Nhận", bg: "rgba(250, 204, 21, 0.15)", border: "#facc15", color: "#fde047" };
    }
  };

  const badge = getStatusBadge(booking.status);
  const shortBookingId = booking.id ? booking.id.slice(0, 8).toUpperCase() : "";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 24px 70px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <button
          onClick={() => navigate(isReader ? "/reader/bookings" : "/bookings")}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "0.92rem",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "14px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#facc15")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          ← Quay lại danh sách đơn
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid rgba(250, 204, 21, 0.2)",
            paddingBottom: "18px",
          }}
        >
          <div>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "2px", color: "#facc15", fontWeight: "700" }}>
              Phiên Trải Bài Trực Tuyến
            </span>
            <h1
              className="font-tarot"
              style={{
                fontSize: "2.8rem",
                color: "#facc15",
                margin: "4px 0 6px 0",
                lineHeight: 1.15,
                fontWeight: "400",
                letterSpacing: "1px",
              }}
            >
              {currentPkg?.name || "The Star"}
            </h1>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Mã đơn: <strong style={{ color: "#e2e8f0", fontFamily: "ui-monospace, monospace" }}>#{shortBookingId}</strong> • Khởi tạo: {new Date(booking.created_at).toLocaleString("vi-VN")}
            </span>
          </div>

          <div
            style={{
              padding: "10px 22px",
              borderRadius: "30px",
              backgroundColor: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.color,
              fontSize: "0.92rem",
              fontWeight: "700",
              letterSpacing: "0.5px",
              boxShadow: `0 0 15px ${badge.bg}`,
            }}
          >
            {badge.text}
          </div>
        </div>
      </div>

      {/* 2 Cột */}
      <div className="booking-detail-layout" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px", alignItems: "start" }}>
        
        {/* CỘT TRÁI */}

        {/* CỘT PHẢI: CHAT */}
        <div
          className="booking-chat-panel"
          style={{
            background: "linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(2, 6, 23, 0.95) 100%)",
            border: "1px solid rgba(250, 204, 21, 0.25)",
            borderRadius: "20px",
            padding: "24px 28px",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            height: "600px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "14px",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3 className="font-tarot" style={{ fontSize: "1.5rem", color: "#facc15", margin: 0, fontWeight: "400" }}>
                Hộp Thoại Tâm Linh 🔮
              </h3>
              <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                Kênh đối thoại trực tiếp giữa Khách hàng và Tarot Reader
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#4ade80" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80" }} />
              Hệ thống kết nối
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              paddingRight: "10px",
              marginBottom: "16px",
            }}
          >
            {isMessagesLoading ? (
              <div style={{ textAlign: "center", color: "#94a3b8", margin: "auto" }}>Đang kết nối tín hiệu...</div>
            ) : !messages || messages.length === 0 ? (
              <div style={{ textAlign: "center", margin: "auto", color: "#94a3b8", maxWidth: "420px", lineHeight: "1.6" }}>
                <div style={{ fontSize: "2.4rem", marginBottom: "10px" }}>✨</div>
                <div style={{ color: "#f1f5f9", fontWeight: "600", fontSize: "1rem", marginBottom: "4px" }}>
                  Chưa có thông điệp nào
                </div>
                <p style={{ fontSize: "0.88rem", color: "#64748b", margin: 0 }}>
                  {isReader
                    ? "Hãy bắt đầu trải bài và gửi kết quả phân tích đầu tiên cho khách hàng."
                    : "Bạn có thể gửi thêm chi tiết câu hỏi, hoặc chờ Reader tiếp nhận và gửi kết quả giải bài tại đây."}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "78%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isMe ? "#1e293b" : "#0f172a",
                        color: isMe ? "#f8fafc" : "#facc15",
                        border: isMe ? "1px solid #334155" : "1px solid rgba(250, 204, 21, 0.4)",
                        padding: "12px 16px",
                        borderRadius: isMe ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                        fontSize: "0.95rem",
                        lineHeight: "1.55",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        boxShadow: isMe ? "0 4px 12px rgba(0,0,0,0.2)" : "0 4px 15px rgba(250, 204, 21, 0.1)",
                      }}
                    >
                      {msg.content}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "4px" }}>
                      {new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {chatError && (
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "8px 12px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "10px" }}>
              {chatError}
            </div>
          )}

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              placeholder={isReader ? "Nhập lời luận giải / câu trả lời cho khách..." : "Nhập câu hỏi hoặc phản hồi của bạn..."}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={sendMessageMutation.isPending}
              style={{
                flex: 1,
                padding: "13px 18px",
                borderRadius: "12px",
                border: "1.5px solid rgba(250, 204, 21, 0.4)",
                backgroundColor: "#030712",
                color: "#ffffff",
                fontSize: "0.95rem",
                outline: "none",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#facc15")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(250, 204, 21, 0.4)")}
            />
            <button
              type="submit"
              disabled={sendMessageMutation.isPending || !messageInput.trim()}
              style={{
                padding: "13px 26px",
                backgroundColor: "#facc15",
                color: "#001f3f",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: sendMessageMutation.isPending || !messageInput.trim() ? "not-allowed" : "pointer",
                opacity: sendMessageMutation.isPending || !messageInput.trim() ? 0.5 : 1,
                boxShadow: "0 4px 15px rgba(250, 204, 21, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              {sendMessageMutation.isPending ? "..." : "Gửi ✦"}
            </button>
          </form>
        </div>
      </div>

      <div className="booking-actions-below-chat">
        {isReader && (
          <div className="booking-action-group">
            <span className="booking-action-label">✦ Thao tác Reader</span>
            {booking.status === "assigned" && (
              <button className="booking-action-button reader-start" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
                {startMutation.isPending ? "Đang xử lý..." : "Bắt đầu trải bài 🔮"}
              </button>
            )}
            {booking.status === "in_progress" && (
              <button className="booking-action-button reader-complete" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                {completeMutation.isPending ? "Đang xử lý..." : "Hoàn thành phiên đọc ✓"}
              </button>
            )}
            {booking.status === "completed" && <div className="booking-completed">✦ Phiên trải bài đã hoàn tất</div>}
          </div>
        )}
        {isDisputing && (
          <button className="booking-action-button dispute-progress" onClick={() => navigate(relatedDispute?.id ? `/disputes/${relatedDispute.id}` : "/disputes")}>
            ⚖️ Xem tiến trình khiếu nại →
          </button>
        )}
        {isCustomer && isCompleted && (
          <button className="booking-action-button dispute-open" onClick={handleOpenDisputeModal}>
            ⚠ Yêu cầu Khiếu nại đơn này
          </button>
        )}
      </div>

      {/* Modal Khiếu Nại */}
      {showDisputeModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7)",
            }}
          >
            <h2 className="font-tarot" style={{ color: "#f87171", fontSize: "2rem", margin: "0 0 10px 0", fontWeight: "400" }}>
              Khiếu Nại Phiên Đọc
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.5", margin: "0 0 18px 0" }}>
              Ban Quản Trị sẽ cùng đối thoại trực tiếp để đảm bảo quyền lợi công bằng nhất cho bạn.
            </p>

            {disputeError && (
              <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "14px" }}>
                {disputeError}
              </div>
            )}

            <form onSubmit={handleSubmitDispute}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#e2e8f0", fontSize: "0.88rem", fontWeight: "600", marginBottom: "6px" }}>
                  Lý do phân loại:
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#030712",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                >
                  <option value="poor_quality">Chất lượng trải bài kém / sơ sài</option>
                  <option value="incomplete_service">Chưa hoàn thành dịch vụ / Chưa trả bài</option>
                  <option value="service_not_as_described">Dịch vụ không đúng như mô tả</option>
                  <option value="inappropriate_conduct">Thái độ hoặc hành vi không phù hợp</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#e2e8f0", fontSize: "0.88rem", fontWeight: "600", marginBottom: "6px" }}>
                  Mô tả chi tiết sự việc:
                </label>
                <textarea
                  rows={4}
                  placeholder="Nêu rõ tình huống bạn gặp phải..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (disputeError) setDisputeError("");
                  }}
                  minLength={10}
                  maxLength={2000}
                  disabled={disputeMutation.isPending}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#030712",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  disabled={disputeMutation.isPending}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "transparent",
                    color: "#94a3b8",
                    border: "1px solid #475569",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={disputeMutation.isPending || description.trim().length < 10}
                  style={{
                    padding: "10px 22px",
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: disputeMutation.isPending || description.trim().length < 10 ? "not-allowed" : "pointer",
                    opacity: disputeMutation.isPending || description.trim().length < 10 ? 0.6 : 1,
                  }}
                >
                  {disputeMutation.isPending ? "Đang gửi..." : "Xác nhận gửi khiếu nại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}