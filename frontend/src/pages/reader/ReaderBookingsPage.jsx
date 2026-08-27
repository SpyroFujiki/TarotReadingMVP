import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAssignedBookings, startBooking, completeBooking } from "../../api/bookingApi";
import { getPackages } from "../../api/packageApi";
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

export default function ReaderBookingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: bookings,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
  } = useQuery({
    queryKey: ["assigned-bookings"],
    queryFn: getAssignedBookings,
    refetchInterval: 4000,
  });

  const { data: packages, isLoading: isPackagesLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
  });

  const startMutation = useMutation({
    mutationFn: (bookingId) => startBooking(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ["assigned-bookings"] });
      navigate(`/bookings/${bookingId}`);
    },
    onError: (err) => alert(err?.detail || err?.message || "Không thể bắt đầu phiên!"),
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId) => completeBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assigned-bookings"] });
    },
    onError: (err) => alert(err?.detail || err?.message || "Không thể hoàn thành phiên!"),
  });

  if (isBookingsLoading || isPackagesLoading) return <LoadingState />;
  if (isBookingsError) {
    return <EmptyState message="Không thể tải danh sách đơn của bạn lúc này." />;
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { text: "✦ Đã hoàn thành", bg: "rgba(34, 197, 94, 0.15)", color: "#15803d", border: "rgba(34, 197, 94, 0.3)" };
      case "in_progress":
        return { text: "🔮 Đang trải bài", bg: "rgba(168, 85, 247, 0.15)", color: "#7e22ce", border: "rgba(168, 85, 247, 0.3)" };
      case "assigned":
        return { text: "👤 Đã nhận (Chưa bắt đầu)", bg: "rgba(59, 130, 246, 0.15)", color: "#1d4ed8", border: "rgba(59, 130, 246, 0.3)" };
      default:
        return { text: status, bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" };
    }
  };

  const getPackageInfo = (pkgId) => {
    const defaultImg = tarotCards[0] || "";
    if (!packages) return { name: "Gói Trải Bài Tarot", image: defaultImg };
    const idx = packages.findIndex((p) => p.id === pkgId);
    const found = packages[idx];
    return {
      name: found?.name || "Gói Trải Bài Tarot",
      image: tarotCards.length > 0 ? tarotCards[Math.max(0, idx) % tarotCards.length] : defaultImg,
    };
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(250, 204, 21, 0.25); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(250, 204, 21, 0.5); }
      `}</style>

      {/* Header đồng bộ font chữ chuẩn ảnh 2 */}
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
            Booking Đang Phụ Trách
          </h1>
          <span style={{ fontSize: "0.88rem", color: "#94a3b8", marginTop: "4px", display: "inline-block" }}>
            Tổng cộng: <strong style={{ color: "#facc15" }}>{bookings?.length || 0}</strong> phiên trải bài
          </span>
        </div>
      </div>

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
          <h2 className="font-tarot" style={{ color: "#facc15", fontSize: "2.2rem", margin: "0 0 12px 0", fontWeight: "400" }}>
            Bạn chưa nhận phiên đọc nào
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "1.05rem", margin: 0 }}>
            Hãy ghé mục <strong>Hàng đợi Reader</strong> để tiếp nhận các yêu cầu mới từ khách hàng.
          </p>
        </div>
      ) : (
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
                      Mã: <strong style={{ color: "#374151" }}>#{shortId}</strong> {dateStr && `• ${dateStr}`}
                    </span>
                  </div>

                  <h3 className="font-tarot" style={{ fontSize: "1.65rem", color: "#001f3f", margin: "0 0 6px 0", lineHeight: 1.2 }}>
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
                      maxWidth: "540px",
                    }}
                  >
                    Chủ đề: <span style={{ fontStyle: "italic", color: "#1f2937" }}>"{item.topic}"</span>
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, borderLeft: "1px solid #e5e7eb", paddingLeft: "24px" }}>
                  {item.status === "assigned" && (
                    <button
                      onClick={() => startMutation.mutate(item.id)}
                      disabled={startMutation.isPending}
                      style={{
                        padding: "10px 18px",
                        backgroundColor: "#a855f7",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
                      }}
                    >
                      Bắt đầu trải bài 🔮
                    </button>
                  )}

                  {item.status === "in_progress" && (
                    <>
                      <button
                        onClick={() => navigate(`/bookings/${item.id}`)}
                        style={{
                          padding: "9px 18px",
                          backgroundColor: "#001f3f",
                          color: "#facc15",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Vào phòng chat ✦
                      </button>
                      <button
                        onClick={() => completeMutation.mutate(item.id)}
                        disabled={completeMutation.isPending}
                        style={{
                          padding: "9px 18px",
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                        }}
                      >
                        Hoàn thành phiên ✓
                      </button>
                    </>
                  )}

                  {item.status === "completed" && (
                    <button
                      onClick={() => navigate(`/bookings/${item.id}`)}
                      style={{
                        padding: "10px 18px",
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "10px",
                        fontSize: "0.88rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Xem lại kết quả →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}