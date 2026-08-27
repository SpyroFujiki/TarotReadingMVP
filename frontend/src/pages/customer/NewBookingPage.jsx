import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPackages } from "../../api/packageApi";
import { createBooking } from "../../api/bookingApi";
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

export default function NewBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const packageIdParam = searchParams.get("packageId");
  const [selectedPackageId, setSelectedPackageId] = useState(packageIdParam || "");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Lấy dữ liệu gói bài từ PostgreSQL
  const { data: packages, isLoading, isError } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
  });

  useEffect(() => {
    if (packageIdParam) {
      setSelectedPackageId(packageIdParam);
    } else if (packages && packages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packages[0].id);
    }
  }, [packageIdParam, packages, selectedPackageId]);

  if (isLoading) return <LoadingState />;
  if (isError || !packages || packages.length === 0) {
    return <EmptyState message="Không thể tải thông tin gói dịch vụ từ hệ thống." />;
  }

  const currentPkg = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const pkgIndex = packages.findIndex((p) => p.id === currentPkg?.id);
  const cardImage = tarotCards.length > 0 ? tarotCards[Math.max(0, pkgIndex) % tarotCards.length] : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createBooking({
        package_id: currentPkg.id,
        topic: topic.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.detail || err?.message || "Không thể khởi tạo đơn đặt lịch. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "6px",
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  };

  if (success) {
    return (
      <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "40px 32px", maxWidth: "460px", width: "100%", textAlign: "center", boxShadow: "0 18px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>✨</div>
          <h2 className="font-tarot" style={{ fontSize: "2rem", color: "#001f3f", margin: "0 0 10px 0" }}>
            Gửi Yêu Cầu Thành Công
          </h2>
          <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 28px 0" }}>
            Đơn trải bài <strong>{currentPkg.name}</strong> của bạn đã được ghi nhận trực tiếp trên hệ thống.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/bookings")}
              style={{ padding: "12px 22px", background: "#001f3f", color: "#facc15", border: "none", borderRadius: "10px", fontSize: "0.92rem", fontWeight: "700", cursor: "pointer" }}
            >
              Xem Đơn Của Tôi →
            </button>
            <Link
              to="/packages"
              style={{ padding: "12px 22px", background: "#f3f4f6", color: "#1f2937", borderRadius: "10px", textDecoration: "none", fontSize: "0.92rem", fontWeight: "600", display: "inline-block" }}
            >
              Xem các gói khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h1
          className="font-tarot"
          style={{
            fontSize: "3rem",
            color: "#facc15",
            margin: "0 0 8px 0",
            lineHeight: 1.15,
            fontWeight: "400",
            letterSpacing: "1px",
          }}
        >
          Đặt Lịch Trải Bài Tarot
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "1rem", margin: 0 }}>
          Chia sẻ câu hỏi hoặc vấn đề bạn muốn được Reader lắng nghe và giải đáp
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "28px", alignItems: "start" }}>
        {/* Cột trái: Tóm tắt gói từ Database */}
        <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "20px", padding: "26px", color: "#ffffff", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", gap: "18px", alignItems: "center", marginBottom: "18px" }}>
            {cardImage && (
              <img
                src={cardImage}
                alt={currentPkg.name}
                style={{ width: "90px", height: "145px", objectFit: "contain", borderRadius: "8px", border: "1.5px solid #facc15", flexShrink: 0, boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", color: "#facc15", fontWeight: "700" }}>Gói dịch vụ</span>
              <h2 className="font-tarot" style={{ fontSize: "1.45rem", margin: 0, color: "#ffffff", lineHeight: "1.25" }}>{currentPkg.name}</h2>
              <div className="font-tarot" style={{ fontSize: "1.5rem", fontWeight: "700", color: "#facc15", marginTop: "2px" }}>{money.format(currentPkg.price)}</div>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>⏱ Phản hồi: {currentPkg.expected_response_minutes} phút</span>
            </div>
          </div>

          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: "1.55", margin: "0 0 18px 0" }}>
            {currentPkg.description}
          </p>

          <div style={{ textAlign: "center", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "16px" }}>
            <Link to="/packages" style={{ color: "#facc15", fontSize: "0.88rem", textDecoration: "underline" }}>
              ← Đổi sang gói khác
            </Link>
          </div>
        </div>

        {/* Cột phải: Form nhập Topic cho Booking */}
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "32px 36px", boxShadow: "0 14px 35px rgba(0,0,0,0.25)" }}>
          <h2 className="font-tarot" style={{ fontSize: "1.75rem", color: "#001f3f", margin: "0 0 22px 0", lineHeight: "1.2" }}>
            Thông Tin Đặt Lịch
          </h2>

          {error && (
            <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px 14px", borderRadius: "8px", fontSize: "0.88rem", marginBottom: "18px", border: "1px solid #f87171" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={labelStyle}>
                Vấn đề / Câu hỏi cần giải đáp <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                rows="6"
                placeholder="Chia sẻ chi tiết vấn đề hiện tại, hoàn cảnh và câu hỏi cụ thể bạn muốn Reader bốc bài..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={isSubmitting}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "15px",
                backgroundColor: "#001f3f",
                color: "#facc15",
                border: "none",
                borderRadius: "10px",
                fontSize: "1.05rem",
                fontWeight: "700",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 6px 18px rgba(0, 31, 63, 0.3)",
                transition: "opacity 0.2s",
              }}
            >
              {isSubmitting ? "Đang gửi thông tin..." : "Xác Nhận Đặt Lịch ✦"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}