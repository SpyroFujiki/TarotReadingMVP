import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Tái sử dụng logic lấy ảnh lá bài Tarot từ assets
const cardAssets = import.meta.glob("../../assets/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
  query: "?url",
});

const tarotCards = Object.entries(cardAssets)
  .filter(([path]) => /(?:The|Cups|Wands|Swords|Pentacles)/.test(path))
  .map(([, source]) => source);

export default function HomePage() {
  const { user } = useAuth();
  
  // Lấy ngẫu nhiên 1 lá bài cho trang chủ
  const featuredCard = tarotCards[0] || "";

  return (
    <div style={{ backgroundColor: "#001f3f", minHeight: "100vh", color: "#f4f4f4", paddingBottom: "100px", position: "relative", overflowX: "hidden" }}>
      
      {/* Hiệu ứng ánh sáng nền mờ ảo */}
      <div style={{ position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)", width: "900px", height: "450px", background: "radial-gradient(circle, rgba(255,215,0,0.07) 0%, rgba(0,31,63,0) 70%)", pointerEvents: "none" }}></div>

      {/* HERO SECTION */}
      <div style={{ textAlign: "center", padding: "80px 20px 50px", maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: "1" }}>
        
        {/* TIÊU ĐỀ CHÍNH: Đã đổi sang font-tarot, chữ thường sang trọng và màu vàng gold */}
        <h1 className="font-tarot" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: "normal", color: "#ffd700", marginBottom: "15px", letterSpacing: "-1px", textShadow: "0 0 30px rgba(255,215,0,0.3)" }}>
          Chào mừng bạn đến với Spyro Taro
        </h1>
        
        <p style={{ fontSize: "1.1rem", color: "#cccccc", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto 40px" }}>
          Gỡ rối hiện tại — Mở lối tương lai. Lắng nghe những thông điệp chữa lành từ các Reader chuyên nghiệp.
        </p>

        {/* LÁ BÀI NỔI BẬT Ở TRANG CHỦ */}
        {featuredCard && (
          <div style={{ marginBottom: "50px", display: "flex", justifyContent: "center" }}>
            <img 
              src={featuredCard} 
              alt="Featured Tarot" 
              style={{ 
                height: "280px", 
                objectFit: "contain", 
                borderRadius: "14px",
                filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
                border: "1px solid rgba(255,215,0,0.3)"
              }} 
            />
          </div>
        )}

      </div>

      {/* CÁC THẺ ĐIỀU HƯỚNG NHANH (Services & Booking) */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 25px", position: "relative", zIndex: "1" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
          gap: "40px" 
        }}>
          
          {/* Thẻ 1: Các gói dịch vụ */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 215, 0, 0.25)",
            borderRadius: "24px",
            padding: "40px 30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s ease"
          }}>
            <div>
              <h2 className="font-tarot" style={{ fontSize: "2.2rem", fontWeight: "normal", color: "#ffd700", marginBottom: "15px", letterSpacing: "-0.5px" }}>
                Các gói dịch vụ
              </h2>
              <p style={{ color: "#cccccc", fontSize: "1rem", lineHeight: "1.7", marginBottom: "30px" }}>
                Khám phá các gói trải bài được thiết kế tỉ mỉ để thấu hiểu từng góc khuất trong tâm hồn bạn.
              </p>
            </div>
            <Link 
              to="/packages" 
              style={{ 
                display: "inline-block",
                padding: "12px 24px", 
                backgroundColor: "transparent",
                border: "1px solid #ffd700", 
                color: "#ffd700", 
                borderRadius: "12px", 
                textDecoration: "none", 
                fontWeight: "600", 
                fontSize: "0.95rem",
                textAlign: "center",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 215, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Xem danh sách gói ✦
            </Link>
          </div>

          {/* Thẻ 2: Bắt đầu hành trình */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 215, 0, 0.25)",
            borderRadius: "24px",
            padding: "40px 30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s ease"
          }}>
            <div>
              <h2 className="font-tarot" style={{ fontSize: "2.2rem", fontWeight: "normal", color: "#ffd700", marginBottom: "15px", letterSpacing: "-0.5px" }}>
                Bắt đầu hành trình
              </h2>
              <p style={{ color: "#cccccc", fontSize: "1rem", lineHeight: "1.7", marginBottom: "30px" }}>
                {!user ? "Tạo tài khoản ngay để gửi chủ đề cần tư vấn và kết nối trực tiếp với reader phù hợp." : "Bạn đã sẵn sàng kết nối với các Reader để gỡ rối những thắc mắc trong tâm hồn chưa?"}
              </p>
            </div>
            <Link 
              to={user ? "/bookings/new" : "/register"} 
              style={{ 
                display: "inline-block",
                padding: "12px 24px", 
                backgroundColor: "#ffd700", 
                color: "#001f3f", 
                borderRadius: "12px", 
                textDecoration: "none", 
                fontWeight: "700", 
                fontSize: "0.95rem",
                textAlign: "center",
                boxShadow: "0 0 20px rgba(255,215,0,0.3)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 25px rgba(255,215,0,0.6)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.3)"}
            >
              {user ? "Tạo lịch hẹn ngay ✦" : "Đăng ký tài khoản ✦"}
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}