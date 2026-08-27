import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPackageById } from "../api/packageApi";
import { LoadingState } from "../components/LoadingState";

// Dữ liệu giả để ngắm giao diện khi Backend đang tắt
const mockPackageDetail = {
  id: "1",
  name: "Gói Tổng Quan Tâm Linh",
  description: "Trải bài 5 lá phân tích toàn diện về công việc, tình cảm, sức khỏe và thông điệp vũ trụ gửi đến bạn trong tháng này. Reader sẽ giúp bạn nhìn nhận lại những vấn đề đang cản trở bước tiến của bạn và đưa ra định hướng phù hợp nhất. \n\nQuyền lợi: \n- Nhận kết quả chi tiết bằng văn bản.\n- Được đặt tối đa 2 câu hỏi phụ để làm rõ vấn đề.",
  price: 150000,
  expected_response_minutes: 1440 // tương đương 24 giờ
};

export default function PublicPackageDetailPage() {
  const { packageId } = useParams();
  
  const query = useQuery({ 
    queryKey: ["package", packageId], 
    queryFn: () => getPackageById(packageId),
    retry: false
  });

  if (query.isLoading) return <LoadingState />;

  // Nếu API lỗi (do chưa có Backend), tự động lấy dữ liệu giả để hiển thị
  const item = query.data || mockPackageDetail; 

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16 px-6">
      <div className="max-w-3xl w-full bg-white/5 border border-[#ffd700]/20 rounded-2xl p-10 backdrop-blur-md">
        
        {/* Nút quay lại */}
        <Link 
          to="/packages" 
          className="inline-flex items-center text-[#cccccc] hover:text-[#ffd700] transition-colors mb-8 text-lg"
        >
          <span className="mr-2">←</span> Các gói dịch vụ
        </Link>
        
        {/* Tiêu đề & Thông tin chính */}
        <p style={{ fontSize: "1.1rem", letterSpacing: "0.2em", fontWeight: "bold", color: "#ffd700", textTransform: "uppercase", marginBottom: "15px" }}>
          CHI TIẾT GÓI
        </p>
        <h1 className="font-tarot" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "bold", color: "#ffffff", marginBottom: "25px", lineHeight: "1.2" }}>
          {item.name}
        </h1>
        
        <div style={{ fontSize: "1.2rem", color: "#cccccc", lineHeight: "1.8", marginBottom: "40px", whiteSpace: "pre-line" }}>
          {item.description || item.desc}
        </div>
        
        {/* Hai thẻ Meta: Giá và Thời gian */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "50px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px" }}>
          <div>
            <span style={{ display: "block", fontSize: "1.1rem", color: "#888888", marginBottom: "8px" }}>Giá dịch vụ</span>
            <strong style={{ fontSize: "2rem", color: "#ffd700" }}>
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
            </strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "1.1rem", color: "#888888", marginBottom: "8px" }}>Phản hồi dự kiến</span>
            <strong style={{ fontSize: "1.5rem", color: "#ffffff" }}>
              {item.expected_response_minutes >= 60 
                ? `${item.expected_response_minutes / 60} giờ` 
                : `${item.expected_response_minutes} phút`}
            </strong>
          </div>
        </div>
        
        {/* Nút Đặt lịch (Chuyển hướng sang module Booking) */}
        <Link 
          to={`/bookings/new?packageId=${item.id}`} 
          style={{ display: "block", textAlign: "center", backgroundColor: "#ffd700", color: "#001f3f", fontSize: "1.3rem", fontWeight: "900", padding: "18px", borderRadius: "12px", transition: "all 0.3s" }}
          className="hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"
        >
          Chọn gói này ✦
        </Link>
      </div>
    </section>
  );
}