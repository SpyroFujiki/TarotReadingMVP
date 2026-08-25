import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
export default function PackagesPage() {
  const query = useQuery({ queryKey: ["packages"], queryFn: () => api.get("/packages") });
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} />;
  return <section className="page-section"><div className="section-heading"><p className="eyebrow">DỊCH VỤ</p><h1>Chọn cách bạn muốn được lắng nghe.</h1><p>Các phiên đọc được thiết kế để bạn bước vào cuộc trò chuyện với một chủ đề rõ ràng.</p></div>{query.data.length === 0 ? <EmptyState title="Chưa có gói đọc đang hoạt động" /> : <div className="package-grid">{query.data.map((item) => <article className="package-card" key={item.id}><p className="card-kicker">{item.expected_response_minutes} phút phản hồi dự kiến</p><h2>{item.name}</h2><p>{item.description}</p><strong>{money.format(item.price)}</strong><div className="card-actions"><Link className="text-link" to={`/packages/${item.id}`}>Xem chi tiết →</Link><Link className="button button-small" to={`/bookings/new?packageId=${item.id}`}>Chọn gói</Link></div></article>)}</div>}</section>;
}
