import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getMyBookings } from "../../api/bookingApi";
import { getPackages } from "../../api/packageApi";
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

export default function MyBookingsPage() {
  const navigate = useNavigate();

  // Lấy danh sách booking từ PostgreSQL
  const {
    data: bookings,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
  } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
  });

  // Lấy danh sách gói bài để map thông tin và hình ảnh
  const { data: packages, isLoading: isPackagesLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
  });

  if (isBookingsLoading || isPackagesLoading) return <LoadingState />;
  if (isBookingsError) {
    return <EmptyState message="Không thể tải lịch sử đặt bài từ máy chủ." />;
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { text: "Đã hoàn thành", bg: "rgba(34, 197, 94, 0.15)", color: "#15803d", border: "rgba(34, 197, 94, 0.3)" };
      case "in_progress":
        return { text: "Reader đang trải bài", bg: "rgba(99, 102, 241, 0.15)", color: "#4338ca", border: "rgba(99, 102, 241, 0.3)" };
      case "assigned":
        return { text: "Reader đã nhận đơn", bg: "rgba(59, 130, 246, 0.15)", color: "#1d4ed8", border: "rgba(59, 130, 246, 0.3)" };
      case "disputed":
        return { text: "Đang khiếu nại", bg: "rgba(239, 68, 68, 0.15)", color: "#b91c1c", border: "rgba(239, 68, 68, 0.3)" };
      case "cancelled":
        return { text: "Đã hủy", bg: "rgba(156, 163, 175, 0.15)", color: "#4b5563", border: "rgba(156, 163, 175, 0.3)" };
      case "pending":
      default:
        return { text: "Đang chờ Reader nhận", bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
    }
  };

  const getPackageInfo = (pkgId) => {
    const defaultImg = tarotCards[0] || "";
    if (!packages) return { name: "Gói Trải Bài Tarot", price: 0, image: defaultImg };
    const idx = packages.findIndex((p) => p.id === pkgId);
    const found = packages[idx];
    return {
      name: found?.name || "Gói Trải Bài Tarot",
      price: found?.price || 0,
      image: tarotCards.length > 0 ? tarotCards[Math.max(0, idx) % tarotCards.length] : defaultImg,
    };
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* CSS tùy chỉnh thanh cuộn trong suốt siêu mảnh */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(250, 204, 21, 0.25);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(250, 204, 21, 0.5);
        }
      `}</style>

      {/* Header khu vực */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          paddingBottom: "18px",
        }}
      >
        <div>
          <h1
            className="font-tarot"
            style={{
              fontSize: "3rem",
              color: "#facc15",
              margin: 0,
              lineHeight: 1.1,
              fontWeight: "400",
              letterSpacing: "1px",
            }}
          >
            Đơn Trải Bài Của Tôi
          </h1>
          {bookings && bookings.length > 0 && (
            <span style={{ fontSize: "0.88rem", color: "#94a3b8", marginTop: "4px", display: "inline-block" }}>
              Tổng cộng: <strong style={{ color: "#facc15" }}>{bookings.length}</strong> phiên đọc bài
            </span>
          )}
        </div>

        <Link
          to="/packages"
          style={{
            padding: "13px 26px",
            backgroundColor: "#facc15",
            color: "#001f3f",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "0.95rem",
            fontWeight: "700",
            boxShadow: "0 6px 20px rgba(250, 204, 21, 0.35)",
            transition: "all 0.2s ease",
          }}
        >
          + Đặt Phiên Mới
        </Link>
      </div>

      {/* GIAO DIỆN KHI CHƯA CÓ BOOKING */}
      {!bookings || bookings.length === 0 ? (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "24px",
            padding: "60px 40px",
            textAlign: "center",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: "2.8rem", marginBottom: "16px" }}>🔮</div>

          <h2
            className="font-tarot"
            style={{ color: "#facc15", fontSize: "2.2rem", margin: "0 0 12px 0", fontWeight: "400" }}
          >
            Bạn chưa có phiên trải bài nào
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto 36px", lineHeight: "1.6" }}>
            Hãy chọn một gói dịch vụ phù hợp để bắt đầu gửi câu hỏi và kết nối trực tiếp cùng các Reader.
          </p>

          <Link
            to="/packages"
            style={{
              display: "inline-block",
              padding: "14px 34px",
              backgroundColor: "#facc15",
              color: "#001f3f",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "700",
              boxShadow: "0 6px 22px rgba(250, 204, 21, 0.35)",
              marginBottom: "48px",
            }}
          >
            Khám Phá Các Gói Đọc Bài ✦
          </Link>
        </div>
      ) : (
        /* GIAO DIỆN DANH SÁCH CÓ THANH CUỘN NHẸ NHÀNG */
        <div
          className="custom-scrollbar"
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            paddingRight: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {bookings.map((item) => {
            const statusInfo = getStatusBadge(item.status);
            const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "";
            const pkgInfo = getPackageInfo(item.package_id);
            const shortId = item.id ? item.id.slice(0, 8).toUpperCase() : "";

            return (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "24px 30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                  gap: "24px",
                }}
              >
                {/* Ảnh lá bài */}
                {pkgInfo.image && (
                  <img
                    src={pkgInfo.image}
                    alt={pkgInfo.name}
                    style={{
                      width: "75px",
                      height: "120px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      border: "1.5px solid #001f3f",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                      flexShrink: 0,
                    }}
                  />
                )}

                {/* Khối thông tin chi tiết */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.border}`,
                      }}
                    >
                      {statusInfo.text}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      Mã đơn: <strong style={{ color: "#374151" }}>#{shortId}</strong> {dateStr && `• ${dateStr}`}
                    </span>
                  </div>

                  <h3
                    className="font-tarot"
                    style={{
                      fontSize: "1.65rem",
                      color: "#001f3f",
                      margin: "0 0 6px 0",
                      lineHeight: 1.2,
                    }}
                  >
                    {pkgInfo.name}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#4b5563",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "580px",
                    }}
                  >
                    Chủ đề / Câu hỏi: <span style={{ fontStyle: "italic", color: "#1f2937" }}>"{item.topic}"</span>
                  </p>
                </div>

                {/* Cột giá tiền & Nút xem */}
                <div style={{ textAlign: "right", flexShrink: 0, borderLeft: "1px solid #e5e7eb", paddingLeft: "26px" }}>
                  <div
                    className="font-tarot"
                    style={{
                      fontSize: "1.55rem",
                      fontWeight: "700",
                      color: "#001f3f",
                      marginBottom: "10px",
                    }}
                  >
                    {money.format(pkgInfo.price)}
                  </div>
                  <button
                    onClick={() => navigate(`/bookings/${item.id}`)}
                    style={{
                      padding: "10px 18px",
                      backgroundColor: "#001f3f",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0, 31, 63, 0.25)",
                      transition: "opacity 0.2s",
                    }}
                  >
                    Vào phòng trải bài →
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