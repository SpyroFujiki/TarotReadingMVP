import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getBookingQueue, claimBooking } from "../../api/bookingApi";
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

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function ReaderQueuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lấy danh sách hàng đợi các đơn chờ nhận
  const {
    data: queue,
    isLoading: isQueueLoading,
    isError: isQueueError,
  } = useQuery({
    queryKey: ["booking-queue"],
    queryFn: getBookingQueue,
    refetchInterval: 5000,
  });

  // Lấy danh sách gói bài để map hình ảnh và thời gian dự kiến
  const { data: packages, isLoading: isPackagesLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
  });

  // Xử lý nhận đơn
  const claimMutation = useMutation({
    mutationFn: (bookingId) => claimBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-queue"] });
      queryClient.invalidateQueries({ queryKey: ["assigned-bookings"] });
      navigate("/reader/bookings");
    },
    onError: (err) => {
      alert(err?.detail || err?.message || "Không thể nhận đơn này!");
    },
  });

  if (isQueueLoading || isPackagesLoading) return <LoadingState />;
  if (isQueueError) {
    return <EmptyState message="Không thể tải danh sách hàng đợi lúc này." />;
  }

  const getPackageInfo = (pkgId) => {
    const defaultImg = tarotCards[0] || "";
    if (!packages) return { name: "Gói Trải Bài Tarot", price: 0, image: defaultImg, minutes: 30 };
    const idx = packages.findIndex((p) => p.id === pkgId);
    const found = packages[idx];
    return {
      name: found?.name || "Gói Trải Bài Tarot",
      price: found?.price || 0,
      image: tarotCards.length > 0 ? tarotCards[Math.max(0, idx) % tarotCards.length] : defaultImg,
      minutes: found?.expected_response_minutes || 30,
    };
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* CSS tùy chỉnh thanh cuộn siêu mỏng */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(250, 204, 21, 0.25); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(250, 204, 21, 0.5); }
      `}</style>

      {/* Header khu vực hàng đợi */}
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
            Hàng Đợi Trải Bài
          </h1>
          <span style={{ fontSize: "0.88rem", color: "#94a3b8", marginTop: "4px", display: "inline-block" }}>
            Đang có <strong style={{ color: "#facc15" }}>{queue?.length || 0}</strong> yêu cầu chờ tiếp nhận
          </span>
        </div>
      </div>

      {/* Danh sách hàng đợi */}
      {!queue || queue.length === 0 ? (
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
            Hàng đợi hiện đang trống
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "1.05rem", margin: 0 }}>
            Tất cả các phiên trải bài đã được tiếp nhận. Yêu cầu mới sẽ hiển thị tại đây theo thời gian thực.
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
          {queue.map((item) => {
            const pkgInfo = getPackageInfo(item.package_id);
            const shortId = item.id ? item.id.slice(0, 8).toUpperCase() : "";
            const isClaiming = claimMutation.isPending && claimMutation.variables === item.id;

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
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fde68a",
                      }}
                    >
                      ⏳ Chờ nhận đơn
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      Mã: <strong style={{ color: "#374151" }}>#{shortId}</strong> • Thời hạn: {pkgInfo.minutes} phút
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
                      lineHeight: "1.45",
                    }}
                  >
                    Chủ đề: <span style={{ fontStyle: "italic", color: "#1f2937", fontWeight: "500" }}>"{item.topic}"</span>
                  </p>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, borderLeft: "1px solid #e5e7eb", paddingLeft: "26px" }}>
                  <div className="font-tarot" style={{ fontSize: "1.55rem", fontWeight: "700", color: "#001f3f", marginBottom: "10px" }}>
                    {money.format(pkgInfo.price)}
                  </div>
                  <button
                    onClick={() => claimMutation.mutate(item.id)}
                    disabled={claimMutation.isPending}
                    style={{
                      padding: "11px 22px",
                      backgroundColor: "#001f3f",
                      color: "#facc15",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "0.92rem",
                      fontWeight: "700",
                      cursor: claimMutation.isPending ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(0, 31, 63, 0.3)",
                      opacity: claimMutation.isPending ? 0.6 : 1,
                    }}
                  >
                    {isClaiming ? "Đang nhận..." : "Nhận Phiên Đọc ✦"}
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