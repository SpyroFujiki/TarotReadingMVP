import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getPackages } from "../../api/packageApi";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { useState } from "react";

// Lấy danh sách ảnh lá bài từ assets
const cardAssets = import.meta.glob("../../assets/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
  query: "?url",
});

const tarotCards = Object.entries(cardAssets)
  .filter(([path]) => /(?:The|Cups|Wands|Swords|Pentacles)/.test(path))
  .map(([, source]) => source);

const getMultipleCards = (startIndex) => {
  return [
    tarotCards[(startIndex) % tarotCards.length],
    tarotCards[(startIndex + 1) % tarotCards.length],
    tarotCards[(startIndex + 2) % tarotCards.length],
  ];
};

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function PackagesPage() {
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const query = useQuery({ 
    queryKey: ["packages"], 
    queryFn: getPackages,
    retry: false 
  });
  
  if (query.isLoading) return <LoadingState />;
  
  if (query.isError) return <EmptyState message="Không thể tải danh sách gói dịch vụ từ hệ thống." />;

  const packages = query.data || [];

  if (packages.length === 0) return <EmptyState message="Hiện chưa có gói dịch vụ nào." />;

  return (
    <div style={{ maxWidth: "1300px", margin: "24px auto 60px", padding: "0 clamp(28px, 5vw, 72px)" }}>
      
      {/* Ẩn triệt để thanh cuộn của modal */}
      <style>{`
        .hide-modal-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-modal-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* KHUNG KÍNH BO GÓC DUY NHẤT */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          padding: "50px 36px 60px",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          textAlign: "center",
        }}
      >
        {/* HEADER SECTION */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            className="font-tarot"
            style={{
              fontSize: "3.2rem",
              color: "#ffffff",
              margin: "0 0 12px 0",
              lineHeight: 1.15,
              fontWeight: "400",
              letterSpacing: "1px",
            }}
          >
            Chọn Gói Trải Bài Của Bạn
          </h1>
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "0.95rem",
              maxWidth: "580px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Mỗi tụ bài là một cánh cửa mở ra sự thật. Hãy lựa chọn gói dịch vụ phù hợp để lắng nghe chỉ dẫn từ các Reader.
          </p>
        </div>

        {/* LƯỚI 3 CỘT CARD BÊN TRONG */}
        <div
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "26px",
            alignItems: "stretch" 
          }}
        >
          {packages.map((pkg, packageIndex) => {
            const isHovered = hoveredId === pkg.id;
            const cards = getMultipleCards(packageIndex);

            return (
              <div 
                key={pkg.id} 
                onMouseEnter={() => setHoveredId(pkg.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: isHovered ? "1px solid rgba(255, 215, 0, 0.7)" : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "34px 24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: isHovered ? "translateY(-5px)" : "translateY(0)",
                }}
              >
                {/* BẤM VÀO HÌNH ĐỂ MỞ MODAL */}
                <div 
                  onClick={() => setSelectedPackage(pkg)}
                  title="Nhấp vào hình để xem chi tiết gói bài"
                  style={{ 
                    height: "155px", 
                    width: "100%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    marginBottom: "20px", 
                    position: "relative",
                    cursor: "pointer" 
                  }}
                >
                  <img 
                    src={cards[1]} 
                    alt="tarot secondary" 
                    style={{ 
                      height: "130px", objectFit: "contain", position: "absolute",
                      filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.5))",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      transform: isHovered ? "translateX(-34px) rotate(-10deg) scale(0.95)" : "translateX(0px) rotate(0deg) scale(0.75)",
                      opacity: isHovered ? 0.9 : 0, zIndex: 1
                    }} 
                  />
                  <img 
                    src={cards[0]} 
                    alt={pkg.name} 
                    style={{ 
                      height: "140px", objectFit: "contain", position: "relative",
                      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                      transition: "transform 0.4s ease",
                      transform: isHovered ? "scale(1.05)" : "scale(1)",
                      zIndex: 2
                    }} 
                  />
                  <img 
                    src={cards[2]} 
                    alt="tarot secondary" 
                    style={{ 
                      height: "130px", objectFit: "contain", position: "absolute",
                      filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.5))",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      transform: isHovered ? "translateX(34px) rotate(10deg) scale(0.95)" : "translateX(0px) rotate(0deg) scale(0.75)",
                      opacity: isHovered ? 0.9 : 0, zIndex: 1
                    }} 
                  />
                </div>
                
                <h2 className="font-tarot" style={{ fontSize: "1.55rem", fontWeight: "normal", color: "#ffd700", marginBottom: "12px", letterSpacing: "-0.5px" }}>
                  {pkg.name}
                </h2>
                
                <p style={{ color: "#cccccc", fontSize: "0.88rem", lineHeight: "1.6", marginBottom: "24px", flexGrow: 1, textAlign: "justify" }}>
                  {pkg.description}
                </p>
                
                <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginBottom: "20px" }}>
                  <div className="font-tarot" style={{ fontSize: "1.65rem", fontWeight: "normal", color: "#ffffff", marginBottom: "4px" }}>
                    {money.format(pkg.price)}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#888888", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Thời gian xem bài: {pkg.expected_response_minutes} phút
                  </div>
                </div>

                {/* CẶP NÚT BẤM */}
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button 
                    onClick={() => setSelectedPackage(pkg)}
                    style={{ 
                      flex: 1, 
                      padding: "10px", 
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255, 215, 0, 0.5)", 
                      color: "#ffd700", 
                      borderRadius: "8px", 
                      fontWeight: "500", 
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Chi tiết
                  </button>
                  <Link 
                    to={`/bookings/new?packageId=${pkg.id}`} 
                    style={{ 
                      flex: 1, 
                      padding: "10px", 
                      backgroundColor: "#ffd700", 
                      color: "#001f3f", 
                      borderRadius: "8px", 
                      textDecoration: "none", 
                      fontWeight: "700", 
                      fontSize: "0.88rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Chọn gói
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL CHI TIẾT ĐÃ DESIGN GIỐNG ẢNH 1, NÚT X ĐẨY LÊN CAO, KHÔNG CÒN SCROLLBAR */}
      {selectedPackage && (
        <div 
          onClick={() => setSelectedPackage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="hide-modal-scrollbar"
            style={{
              backgroundColor: "#ececed",
              color: "#1a1a1a",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "88vh",
              borderRadius: "36px",
              padding: "36px 36px 32px",
              position: "relative",
              overflowY: "auto",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.45)",
            }}
          >
            {/* Nút X đóng Modal ở góc cao thoáng mắt */}
            <button 
              onClick={() => setSelectedPackage(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "24px",
                background: "none",
                border: "none",
                fontSize: "1.4rem",
                cursor: "pointer",
                color: "#555555",
                fontWeight: "300",
                lineHeight: "1",
                padding: "4px",
                transition: "color 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#000000"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#555555"}
            >
              ✕
            </button>

            {/* Tagline phía trên */}
            <div style={{ textAlign: "center", fontSize: "0.78rem", color: "#666666", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "18px", padding: "0 20px" }}>
              {selectedPackage.description || "Thông tin chi tiết gói dịch vụ"}
            </div>

            {/* Ảnh lá bài trung tâm */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <img 
                src={getMultipleCards(selectedPackage.cardIndex || 0)[0]} 
                alt={selectedPackage.name} 
                style={{ height: "215px", objectFit: "contain", borderRadius: "10px", filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.18))" }} 
              />
            </div>

            {/* Tên Gói */}
            <h2 className="font-tarot" style={{ textAlign: "center", fontSize: "2rem", fontWeight: "normal", color: "#111827", margin: "0 0 16px 0", lineHeight: "1.2" }}>
              {selectedPackage.name}
            </h2>

            {/* Hộp mô tả xám nhạt */}
            <div style={{
              backgroundColor: "#dfdfdf",
              borderRadius: "16px",
              padding: "18px 20px",
              fontSize: "0.92rem",
              lineHeight: "1.6",
              color: "#2b2b2b",
              textAlign: "center",
              marginBottom: "24px"
            }}>
              {selectedPackage.description}
            </div>

            <div style={{ marginBottom: "30px", color: "#4b5563", fontSize: "0.92rem" }}>
              Thời gian phản hồi dự kiến: <strong>{selectedPackage.expected_response_minutes} phút</strong>
            </div>

            {/* Chân Modal: Phí & Nút Đặt Lịch */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              borderTop: "1px solid #d1d5db", 
              paddingTop: "18px" 
            }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "600" }}>Mức phí dịch vụ</div>
                <div style={{ fontSize: "1.45rem", fontWeight: "700", color: "#111827" }}>
                  {money.format(selectedPackage.price)}
                </div>
              </div>
              <Link 
                to={`/bookings/new?packageId=${selectedPackage.id}`} 
                style={{ 
                  backgroundColor: "#001f3f", 
                  color: "#ffd700", 
                  padding: "12px 24px", 
                  borderRadius: "12px", 
                  textDecoration: "none", 
                  fontWeight: "700", 
                  fontSize: "0.95rem",
                  boxShadow: "0 8px 18px rgba(0, 31, 63, 0.25)"
                }}
              >
                Chọn gói này ✦
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}