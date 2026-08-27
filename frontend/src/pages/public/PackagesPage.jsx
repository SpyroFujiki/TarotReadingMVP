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
  .filter(([path]) => /(?:The|Cups|Wands|Swords|Pentacles)/.test(path)) // Đã sửa đúng cú pháp filter chuẩn
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
    <div style={{ backgroundColor: "#001f3f", minHeight: "100vh", color: "#f4f4f4", paddingBottom: "120px", position: "relative", overflowX: "hidden" }}>
      
      {/* Hiệu ứng ánh sáng nền */}
      <div style={{ position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)", width: "800px", height: "400px", background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, rgba(0,31,63,0) 70%)", pointerEvents: "none" }}></div>

      {/* HEADER SECTION */}
      <div style={{ textAlign: "center", padding: "60px 20px 40px", maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: "1" }}>
        <h1 className="font-tarot" style={{ fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)", fontWeight: "normal", color: "#ffffff", marginBottom: "15px", letterSpacing: "-1px" }}>
          Chọn Gói Trải Bài Của Bạn
        </h1>
        <p style={{ fontSize: "1rem", color: "#cccccc", lineHeight: "1.6", maxWidth: "550px", margin: "0 auto" }}>
          Mỗi tụ bài là một cánh cửa mở ra sự thật. Hãy lựa chọn gói dịch vụ phù hợp để lắng nghe chỉ dẫn từ các Reader.
        </p>
      </div>

      {/* CONTAINER CHỨA CÁC THẺ CARD */}
      <div style={{ maxWidth: "1250px", margin: "0 auto", padding: "0 25px", position: "relative", zIndex: "1" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "30px",
          alignItems: "stretch" 
        }}>
          {packages.map((pkg) => {
            const isHovered = hoveredId === pkg.id;
            const cards = getMultipleCards(pkg.cardIndex || 0);

            return (
              <div 
                key={pkg.id} 
                onMouseEnter={() => setHoveredId(pkg.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 215, 0, 0.25)",
                  borderRadius: "20px",
                  padding: "35px 24px 30px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                  borderColor: isHovered ? "rgba(255, 215, 0, 0.7)" : "rgba(255, 215, 0, 0.25)",
                }}
              >
                
                {/* KHUNG LÁ BÀI (Hiệu ứng xòe khi hover) */}
                <div style={{ height: "150px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", position: "relative" }}>
                  <img 
                    src={cards[1]} 
                    alt="tarot secondary" 
                    style={{ 
                      height: "125px", objectFit: "contain", position: "absolute",
                      filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.5))",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      transform: isHovered ? "translateX(-32px) rotate(-10deg) scale(0.95)" : "translateX(0px) rotate(0deg) scale(0.75)",
                      opacity: isHovered ? 0.9 : 0, zIndex: 1
                    }} 
                  />
                  <img 
                    src={cards[0]} 
                    alt={pkg.name} 
                    style={{ 
                      height: "135px", objectFit: "contain", position: "relative",
                      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                      transition: "transform 0.4s ease",
                      transform: isHovered ? "scale(1.04)" : "scale(1)",
                      zIndex: 2
                    }} 
                  />
                  <img 
                    src={cards[2]} 
                    alt="tarot secondary" 
                    style={{ 
                      height: "125px", objectFit: "contain", position: "absolute",
                      filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.5))",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      transform: isHovered ? "translateX(32px) rotate(10deg) scale(0.95)" : "translateX(0px) rotate(0deg) scale(0.75)",
                      opacity: isHovered ? 0.9 : 0, zIndex: 1
                    }} 
                  />
                </div>
                
                <h2 className="font-tarot" style={{ fontSize: "1.6rem", fontWeight: "normal", color: "#ffd700", marginBottom: "12px", letterSpacing: "-0.5px" }}>
                  {pkg.name}
                </h2>
                
                <p style={{ color: "#cccccc", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "25px", flexGrow: 1 }}>
                  {pkg.description}
                </p>
                
                <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffffff", marginBottom: "6px" }}>
                    {money.format(pkg.price)}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#888888", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Nhận kết quả trong: {pkg.expected_response_time || `${pkg.expected_response_minutes} phút`}
                  </div>
                </div>

                {/* CẶP NÚT BẤM */}
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button 
                    onClick={() => setSelectedPackage(pkg)}
                    style={{ 
                      flex: 1, 
                      padding: "12px 10px", 
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255, 215, 0, 0.6)", 
                      color: "#ffd700", 
                      borderRadius: "10px", 
                      fontWeight: "500", 
                      fontSize: "0.9rem",
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
                      padding: "12px 10px", 
                      backgroundColor: "#ffd700", 
                      color: "#001f3f", 
                      borderRadius: "10px", 
                      textDecoration: "none", 
                      fontWeight: "700", 
                      fontSize: "0.9rem",
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

      {/* MODAL CHI TIẾT */}
      {selectedPackage && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#f4f4f4",
            color: "#1a1a1a",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            borderRadius: "28px",
            padding: "40px",
            position: "relative",
            overflowY: "auto",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
          }}>
            
            <button 
              onClick={() => setSelectedPackage(null)}
              style={{
                position: "absolute",
                top: "25px",
                right: "25px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#1a1a1a",
                fontWeight: "300"
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: "center", fontSize: "0.85rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "20px" }}>
              {selectedPackage.tagline}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
              <img 
                src={getMultipleCards(selectedPackage.cardIndex || 0)[0]} 
                alt={selectedPackage.name} 
                style={{ height: "240px", objectFit: "contain", filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.2))" }} 
              />
            </div>

            <h2 className="font-tarot" style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: "normal", color: "#1a1a1a", marginBottom: "15px" }}>
              {selectedPackage.name}
            </h2>

            <div style={{
              backgroundColor: "#eaeaea",
              borderRadius: "16px",
              padding: "20px",
              fontSize: "0.95rem",
              lineHeight: "1.6",
              color: "#333",
              textAlign: "center",
              marginBottom: "30px"
            }}>
              {selectedPackage.description}
            </div>

            <div style={{ marginBottom: "25px" }}>
              <h3 className="font-tarot" style={{ fontSize: "1.4rem", fontWeight: "normal", marginBottom: "8px", color: "#1a1a1a" }}>
                Năng lượng
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: "1.6" }}>
                {selectedPackage.energyText}
              </p>
            </div>

            <div style={{ marginBottom: "35px" }}>
              <h3 className="font-tarot" style={{ fontSize: "1.4rem", fontWeight: "normal", marginBottom: "8px", color: "#1a1a1a" }}>
                Hành động
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: "1.6" }}>
                {selectedPackage.actionText}
              </p>
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              borderTop: "1px solid #ddd", 
              paddingTop: "20px" 
            }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#777", textTransform: "uppercase" }}>Mức phí đầu tư</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1a1a1a" }}>
                  {money.format(selectedPackage.price)}
                </div>
              </div>
              <Link 
                to={`/bookings/new?packageId=${selectedPackage.id}`} 
                style={{ 
                  backgroundColor: "#1a1a1a", 
                  color: "#ffffff", 
                  padding: "14px 28px", 
                  borderRadius: "12px", 
                  textDecoration: "none", 
                  fontWeight: "600", 
                  fontSize: "1rem",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.15)"
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