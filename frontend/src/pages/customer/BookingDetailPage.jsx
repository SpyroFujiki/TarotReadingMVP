import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookingDetail } from "../../api/bookingApi";
import { getServiceMessages, sendServiceMessage } from "../../api/serviceMessageApi";
import { getPackages } from "../../api/packageApi";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

// Lấy danh sách ảnh lá bài từ assets
const cardAssets = import.meta.glob("../../assets/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
  query: "?url",
});

const tarotCards = Object.entries(cardAssets)
  .filter(([path]) => /(?:The|Cups|Wands|Swords|Pentacles)/.test(path))
  .map(([, source]) => source);

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [messageInput, setMessageInput] = useState("");
  const [chatError, setChatError] = useState("");
  const chatBottomRef = useRef(null);

  // Lấy chi tiết đơn đặt bài
  const {
    data: booking,
    isLoading: isBookingLoading,
    isError: isBookingError,
  } = useQuery({
    queryKey: ["booking-detail", bookingId],
    queryFn: () => getBookingDetail(bookingId),
    enabled: !!bookingId,
    refetchInterval: 4000,
  });

  // Lấy thông tin các gói bài
  const { data: packages } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
  });

  // Lấy danh sách tin nhắn trao đổi
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["service-messages", bookingId],
    queryFn: () => getServiceMessages(bookingId),
    enabled: !!bookingId,
    refetchInterval: 2500,
  });

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mutation gửi tin nhắn
  const sendMessageMutation = useMutation({
    mutationFn: (content) => sendServiceMessage(bookingId, { content }),
    onSuccess: () => {
      setMessageInput("");
      setChatError("");
      queryClient.invalidateQueries({ queryKey: ["service-messages", bookingId] });
    },
    onError: (err) => {
      setChatError(err?.detail || err?.message || "Không thể gửi tin nhắn. Hãy kiểm tra trạng thái đơn!");
    },
  });

  if (isBookingLoading) return <LoadingState />;
  if (isBookingError || !booking) {
    return <EmptyState message="Không tìm thấy thông tin phiên trải bài này." />;
  }

  const currentPkg = packages?.find((p) => p.id === booking.package_id);
  const pkgIndex = packages?.findIndex((p) => p.id === currentPkg?.id) ?? 0;
  const cardImg = tarotCards.length > 0 ? tarotCards[Math.max(0, pkgIndex) % tarotCards.length] : null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sendMessageMutation.isPending) return;
    setChatError("");
    sendMessageMutation.mutate(messageInput.trim());
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { text: "✦ Đã Hoàn Thành", bg: "rgba(34, 197, 94, 0.15)", border: "#22c55e", color: "#4ade80" };
      case "in_progress":
        return { text: "🔮 Đang Trải Bài", bg: "rgba(168, 85, 247, 0.2)", border: "#a855f7", color: "#d8b4fe" };
      case "assigned":
        return { text: "👤 Reader Đã Nhận Đơn", bg: "rgba(59, 130, 246, 0.2)", border: "#3b82f6", color: "#93c5fd" };
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
      {/* Nút quay lại & Header */}
      <div style={{ marginBottom: "28px" }}>
        <button
          onClick={() => navigate("/bookings")}
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
                textShadow: "0 0 20px rgba(250, 204, 21, 0.3)",
              }}
            >
              {currentPkg?.name || "The Star"}
            </h1>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Mã đơn: <strong style={{ color: "#e2e8f0" }}>#{shortBookingId}</strong> • Khởi tạo: {new Date(booking.created_at).toLocaleString("vi-VN")}
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

      {/* Khung chính: 2 Cột Huyền Bí */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "28px", alignItems: "start" }}>
        
        {/* CỘT TRÁI: THẺ THÔNG TIN GÓI DỊCH VỤ */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.95) 100%)",
            border: "1px solid rgba(250, 204, 21, 0.25)",
            borderRadius: "20px",
            padding: "26px",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {cardImg && (
            <div style={{ textAlign: "center" }}>
              <img
                src={cardImg}
                alt="Tarot Card"
                style={{
                  width: "120px",
                  height: "190px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  border: "2px solid #facc15",
                  boxShadow: "0 8px 24px rgba(250, 204, 21, 0.25)",
                }}
              />
            </div>
          )}

          <div>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: "600" }}>
              Mức phí dịch vụ
            </span>
            <div className="font-tarot" style={{ fontSize: "1.8rem", color: "#facc15", fontWeight: "700", marginTop: "2px" }}>
              {money.format(currentPkg?.price || 0)}
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: "600", display: "block", marginBottom: "6px" }}>
              Chủ đề & Câu hỏi của bạn
            </span>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "12px 16px",
                color: "#f1f5f9",
                fontSize: "0.95rem",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
              }}
            >
              {booking.topic}
            </div>
          </div>

          <div
            style={{
              background: "rgba(250, 204, 21, 0.05)",
              border: "1px solid rgba(250, 204, 21, 0.15)",
              borderRadius: "12px",
              padding: "12px",
              fontSize: "0.85rem",
              color: "#cbd5e1",
              lineHeight: "1.45",
            }}
          >
            ✦ <strong>Lưu ý:</strong> Reader sẽ nhận đơn và phản hồi phân tích trực tiếp qua khung chat bên cạnh.
          </div>
        </div>

        {/* CỘT PHẢI: PHÒNG CHAT TRẢI BÀI */}
        <div
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
          {/* Header phòng chat */}
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
              <h3 className="font-tarot" style={{ fontSize: "1.5rem", color: "#facc15", margin: 0 }}>
                Hộp Thoại Tâm Linh 🔮
              </h3>
              <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                Kênh đối thoại trực tiếp giữa bạn và Tarot Reader
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#4ade80" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80" }} />
              Hệ thống kết nối
            </div>
          </div>

          {/* Vùng hiển thị tin nhắn */}
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
              <div
                style={{
                  textAlign: "center",
                  margin: "auto",
                  color: "#94a3b8",
                  maxWidth: "420px",
                  lineHeight: "1.6",
                }}
              >
                <div style={{ fontSize: "2.4rem", marginBottom: "10px" }}>✨</div>
                <div style={{ color: "#f1f5f9", fontWeight: "600", fontSize: "1rem", marginBottom: "4px" }}>
                  Chưa có thông điệp nào
                </div>
                <p style={{ fontSize: "0.88rem", color: "#64748b", margin: 0 }}>
                  Bạn có thể gửi thêm chi tiết câu hỏi, hoặc chờ Reader tiếp nhận và gửi kết quả giải bài tại đây.
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

          {/* Cảnh báo lỗi nếu có */}
          {chatError && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                color: "#fca5a5",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "10px",
              }}
            >
              {chatError}
            </div>
          )}

          {/* Form gửi tin nhắn */}
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Nhập câu hỏi hoặc phản hồi của bạn..."
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
    </div>
  );
}