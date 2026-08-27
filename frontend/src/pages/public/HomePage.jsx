import { useState } from "react";
import { Link } from "react-router-dom";

const TAROT_CARDS = [
  {
    name: "The Fool",
    meaning: "Khởi đầu mới • Năng lượng thuần khiết • Sự tự do",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg",
  },
  {
    name: "The Magician",
    meaning: "Sáng tạo • Tiềm năng vô hạn • Ý chí mạnh mẽ",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg",
  },
  {
    name: "The High Priestess",
    meaning: "Trực giác • Bí ẩn nội tâm • Trí tuệ sâu sắc",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg",
  },
  {
    name: "The Empress",
    meaning: "Nuôi dưỡng • Trù phú • Tình mẫu tử & thịnh vượng",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg",
  },
  {
    name: "The Lovers",
    meaning: "Gắn kết tình cảm • Sự lựa chọn • Thấu hiểu",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_06_Lovers.jpg",
  },
  {
    name: "The Star",
    meaning: "Hy vọng • Chữa lành • Nguồn cảm hứng tươi sáng",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg",
  },
  {
    name: "The Sun",
    meaning: "Niềm vui • Thành công rực rỡ • Sinh lực tràn đầy",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg",
  },
];

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleCardClick = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    // Thời gian lật bài nửa vòng thì đổi ảnh
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % TAROT_CARDS.length);
    }, 250);

    // Hoàn tất hiệu ứng xoay lật
    setTimeout(() => {
      setIsFlipping(false);
    }, 500);
  };

  const currentCard = TAROT_CARDS[currentIndex];

  return (
    <div style={{ maxWidth: "1120px", margin: "32px auto 60px", padding: "0 20px" }}>
      {/* KHUNG BAO NGOÀI BO GÓC & MỞ RỘNG */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          padding: "52px 40px 60px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(12px)",
          textAlign: "center",
        }}
      >
        {/* Phần Tiêu Đề Hero */}
        <div style={{ marginBottom: "36px" }}>
          <h1
            className="font-tarot"
            style={{
              fontSize: "3.4rem",
              color: "#facc15",
              margin: "0 0 14px 0",
              lineHeight: 1.2,
              fontWeight: "400",
              letterSpacing: "1.5px",
            }}
          >
            Chào mừng bạn đến với
            <br />
            Spyro Taro
          </h1>
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "1.05rem",
              maxWidth: "640px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Gỡ rối hiện tại — Mở lối tương lai. Lắng nghe những thông điệp chữa lành từ các Reader chuyên nghiệp.
          </p>
        </div>

        {/* Khung Lá Bài Có Animation Khi Click */}
        <div style={{ marginBottom: "48px", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
          <div
            onClick={handleCardClick}
            style={{
              cursor: "pointer",
              perspective: "1000px",
              display: "inline-block",
              userSelect: "none",
            }}
            title="Nhấp vào lá bài để bốc lá ngẫu nhiên khác!"
          >
            <div
              style={{
                transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
                transformStyle: "preserve-3d",
                transform: isFlipping ? "rotateY(90deg) scale(0.92)" : "rotateY(0deg) scale(1)",
              }}
            >
              <img
                src={currentCard.image}
                alt={currentCard.name}
                style={{
                  width: "165px",
                  height: "275px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  border: "2px solid rgba(250, 204, 21, 0.8)",
                  boxShadow: "0 14px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(250, 204, 21, 0.25)",
                  display: "block",
                  transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 18px 45px rgba(0, 0, 0, 0.8), 0 0 35px rgba(250, 204, 21, 0.45)";
                  e.currentTarget.style.borderColor = "#fde047";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 14px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(250, 204, 21, 0.25)";
                  e.currentTarget.style.borderColor = "rgba(250, 204, 21, 0.8)";
                }}
              />
            </div>
          </div>

          {/* Tên & Ý nghĩa của lá bài vừa lật */}
          <div style={{ marginTop: "14px" }}>
            <span
              className="font-tarot"
              style={{
                fontSize: "1.25rem",
                color: "#ffffff",
                display: "block",
                marginBottom: "4px",
                letterSpacing: "0.5px",
              }}
            >
              {currentCard.name}
            </span>
            <span style={{ fontSize: "0.88rem", color: "#facc15", fontStyle: "italic" }}>
              ✨ {currentCard.meaning}
            </span>
            <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", marginTop: "6px" }}>
              (Nhấp vào lá bài để đổi lá tiếp theo)
            </span>
          </div>
        </div>

        {/* Hai Khối Thao Tác Bên Dưới */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            textAlign: "left",
          }}
        >
          {/* Khối 1: Xem Dịch vụ */}
          <Link
            to="/packages"
            style={{
              display: "block",
              textDecoration: "none",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "18px",
              padding: "28px 26px",
              backdropFilter: "blur(8px)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#facc15";
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h2
              className="font-tarot"
              style={{
                fontSize: "1.7rem",
                color: "#facc15",
                margin: "0 0 10px 0",
                fontWeight: "400",
              }}
            >
              Các gói dịch vụ
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.55", margin: 0 }}>
              Khám phá các gói trải bài được thiết kế tỉ mỉ để thấu hiểu từng góc khuất trong tâm hồn bạn.
            </p>
          </Link>

          {/* Khối 2: Đặt lịch */}
          <Link
            to="/bookings/new"
            style={{
              display: "block",
              textDecoration: "none",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "18px",
              padding: "28px 26px",
              backdropFilter: "blur(8px)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#facc15";
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h2
              className="font-tarot"
              style={{
                fontSize: "1.7rem",
                color: "#facc15",
                margin: "0 0 10px 0",
                fontWeight: "400",
              }}
            >
              Bắt đầu hành trình
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.55", margin: 0 }}>
              Bạn đã sẵn sàng kết nối với các Reader để gỡ rối những thắc mắc trong tâm hồn chưa?
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}