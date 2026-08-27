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

const mockPackages = [
  {
    id: "1",
    name: "Gói Tổng Quan Tâm Linh",
    tagline: "thấu tỏ tương lai ✦ định hướng chọn lựa ✦ khai mở vận mệnh",
    description: "Trải bài 5 lá phân tích toàn diện về công việc, tình cảm, sức khỏe và thông điệp vũ trụ gửi đến bạn trong tháng này. Năng lượng từ các lá bài sẽ soi sáng những góc tối bạn đang bỏ quên.",
    energyText: "Năng lượng chủ đạo: Cảm giác đứng trước ngưỡng cửa của một hành trình mới. Trái tim đập rộn ràng và tâm trí háo hức đón nhận cơ hội.",
    actionText: "Hành động khuyên dùng: Dũng cảm dấn thân vào thử thách mới, đặt câu hỏi trước khi quá muộn.",
    price: 150000,
    expected_response_time: "24 giờ",
    cardIndex: 0
  },
  {
    id: "2",
    name: "Gói Tình Duyên Thần Tốc",
    tagline: "kết nối tâm hồn ✦ thấu hiểu người ấy ✦ hóa giải khoảng cách",
    description: "Giải đáp nhanh 1 câu hỏi cụ thể về người ấy, mối quan hệ hiện tại hoặc tương lai tình cảm. Phá vỡ mọi sự mập mờ và đưa ra lời khuyên chân thực.",
    energyText: "Năng lượng chủ đạo: Sự rung động mãnh liệt và khao khát kết nối sâu sắc từ trực giác vũ trụ.",
    actionText: "Hành động khuyên dùng: Thành thật với cảm xúc của chính mình, chủ động sẻ chia thay vì giữ trong lòng.",
    price: 85000,
    expected_response_time: "2 giờ",
    cardIndex: 3
  },
  {
    id: "3",
    name: "Gói Định Hướng Sự Nghiệp",
    tagline: "bứt phá giới hạn ✦ nắm bắt thời cơ ✦ vươn tầm thành công",
    description: "Trải bài chuyên sâu 7 lá về con đường công danh, tìm ra điểm mạnh yếu và ngã rẽ phù hợp cho tương lai của bạn trong giai đoạn chuyển giao.",
    energyText: "Năng lượng chủ đạo: Khát vọng khẳng định vị thế và tìm kiếm mục đích sống đích thực.",
    actionText: "Hành động khuyên dùng: Lập kế hoạch hành động chi tiết, sẵn sàng đón nhận các cơ hội hợp tác lớn.",
    price: 250000,
    expected_response_time: "48 giờ",
    cardIndex: 6
  }
];

export default function PackagesPage() {
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const query = useQuery({ 
    queryKey: ["packages"], 
    queryFn: getPackages,
    retry: false 
  });
  
  if (query.isLoading) return <LoadingState />;
  
  const packages = query.data || mockPackages; 

  if (packages.length === 0) return <EmptyState message="Hiện chưa có gói dịch vụ nào." />;

  return (
    <div style={{ maxWidth: "1300px", margin: "24px auto 60px", padding: "0 20px" }}>
      
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
          {packages.map((pkg) => {
            const isHovered = hoveredId === pkg.id;
            const cards = getMultipleCards(pkg.cardIndex || 0);

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
                    Nhận kết quả trong: {pkg.expected_response_time || `${pkg.expected_response_minutes} phút`}
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
              {selectedPackage.tagline}
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

            {/* Mục Năng lượng */}
            <div style={{ marginBottom: "20px" }}>
              <h3 className="font-tarot" style={{ fontSize: "1.35rem", fontWeight: "normal", marginBottom: "6px", color: "#111827" }}>
                Năng lượng
              </h3>
              <p style={{ fontSize: "0.92rem", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>
                {selectedPackage.energyText}
              </p>
            </div>

            {/* Mục Hành động */}
            <div style={{ marginBottom: "30px" }}>
              <h3 className="font-tarot" style={{ fontSize: "1.35rem", fontWeight: "normal", marginBottom: "6px", color: "#111827" }}>
                Hành động
              </h3>
              <p style={{ fontSize: "0.92rem", color: "#4b5563", lineHeight: "1.6", margin: 0 }}>
                {selectedPackage.actionText}
              </p>
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
                <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "600" }}>Mức phí đầu tư</div>
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