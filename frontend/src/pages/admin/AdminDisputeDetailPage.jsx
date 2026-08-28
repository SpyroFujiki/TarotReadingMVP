import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getDisputeDetail, getDisputeMessages, sendDisputeMessage } from "../../api/disputeApi";
import { getBookingDetail } from "../../api/bookingApi";
import { getServiceMessages } from "../../api/serviceMessageApi";
import { claimDispute, resolveDispute } from "../../api/adminApi";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { getVerdictLabel, money } from "../../utils/disputeLabels";

export default function AdminDisputeDetailPage() {
  const { disputeId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [verdict, setVerdict] = useState("rejected");
  const [refundAmount, setRefundAmount] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [error, setError] = useState("");

  const disputeQuery = useQuery({ queryKey: ["admin-dispute", disputeId], queryFn: () => getDisputeDetail(disputeId) });
  const dispute = disputeQuery.data;
  const isAssigned = dispute?.admin_id === user?.id;
  const messagesQuery = useQuery({
    queryKey: ["dispute-messages", disputeId],
    queryFn: () => getDisputeMessages(disputeId),
    enabled: Boolean(dispute && isAssigned),
    refetchInterval: 3000,
  });
  const serviceMessagesQuery = useQuery({
    queryKey: ["admin-service-messages", dispute?.booking_id],
    queryFn: async () => {
      await getBookingDetail(dispute.booking_id);
      return getServiceMessages(dispute.booking_id);
    },
    enabled: Boolean(dispute?.booking_id && isAssigned),
    refetchInterval: 3000,
  });
  const claimMutation = useMutation({
    mutationFn: () => claimDispute(disputeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dispute", disputeId] }),
    onError: (err) => setError(err.detail || "Không thể nhận khiếu nại."),
  });
  const messageMutation = useMutation({
    mutationFn: () => sendDisputeMessage(disputeId, { content: message.trim() }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["dispute-messages", disputeId] });
    },
    onError: (err) => setError(err.detail || "Không thể gửi tin nhắn."),
  });
  const resolveMutation = useMutation({
    mutationFn: () => resolveDispute(disputeId, {
      verdict,
      refund_amount: refundAmount === "" ? null : Number(refundAmount),
      resolution_note: resolutionNote.trim(),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dispute", disputeId] }),
    onError: (err) => setError(err.detail || "Không thể giải quyết khiếu nại."),
  });

  if (disputeQuery.isLoading) return <LoadingState />;
  if (disputeQuery.isError || !dispute) return <EmptyState message="Không tìm thấy khiếu nại này." />;
  const closed = dispute.status === "resolved" || dispute.status === "rejected";
  const verdictLabel = getVerdictLabel(dispute.verdict);

  const handleResolve = (event) => {
    event.preventDefault();
    setError("");
    resolveMutation.mutate();
  };

  return (
    <section className="page-section">
      <Link className="text-link" to="/admin/disputes">← Hàng đợi khiếu nại</Link>
      <div className="section-heading">
        <p className="eyebrow">KHIẾU NẠI {dispute.id.slice(0, 8).toUpperCase()}</p>
        <h1>{dispute.reason_category}</h1>
        <p className="lead">Trạng thái: <strong>{dispute.status}</strong> · Kết luận: <strong>{verdictLabel}</strong>{dispute.refund_amount != null && ` (${money.format(dispute.refund_amount)})`} · Booking: {dispute.booking_id}</p>
      </div>
      <div className="info-grid">
        <span>Mô tả<strong>{dispute.description}</strong></span>
        <span>Người xử lý<strong>{isAssigned ? "Bạn" : dispute.admin_id ? "Admin khác" : "Chưa nhận"}</strong></span>
      </div>
      {error && <p className="form-error">{error}</p>}
      {!closed && !isAssigned && !dispute.admin_id && (
        <button className="button" disabled={claimMutation.isPending} onClick={() => claimMutation.mutate()}>
          {claimMutation.isPending ? "Đang nhận..." : "Nhận khiếu nại này"}
        </button>
      )}
      {!closed && !isAssigned && dispute.admin_id && <p className="lead">Khiếu nại đang do admin khác xử lý.</p>}
      {isAssigned && !closed && (
        <>
          <div className="admin-conversation-grid">
          <div className="package-card admin-conversation-panel">
            <p className="card-kicker">TRAO ĐỔI PHIÊN ĐỌC</p>
            <p className="lead">Lịch sử trao đổi giữa customer và reader trước khi khiếu nại.</p>
            {serviceMessagesQuery.isLoading ? <p className="lead">Đang tải tin nhắn...</p> : serviceMessagesQuery.data?.length ? serviceMessagesQuery.data.map((item) => (
              <p key={item.id}><strong>{item.sender_id === dispute.raised_by_id ? "Khách hàng" : "Reader"}:</strong> {item.content}</p>
            )) : <p className="lead">Chưa có tin nhắn phiên đọc.</p>}
          </div>
          <div className="package-card">
            <p className="card-kicker">TRAO ĐỔI</p>
            {messagesQuery.data?.length ? messagesQuery.data.map((item) => (
              <p key={item.id}><strong>{item.sender_id === user.id ? "Bạn" : "Người dùng"}:</strong> {item.content}</p>
            )) : <p className="lead">Chưa có tin nhắn.</p>}
            <form onSubmit={(event) => { event.preventDefault(); if (message.trim()) messageMutation.mutate(); }}>
              <label>Tin nhắn<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows="3" /></label>
              <button className="button button-small" disabled={messageMutation.isPending}>Gửi tin nhắn</button>
            </form>
          </div>
          </div>
          <form className="package-card" onSubmit={handleResolve}>
            <p className="card-kicker">QUYẾT ĐỊNH</p>
            <label>Kết quả<select value={verdict} onChange={(event) => setVerdict(event.target.value)}><option value="rejected">Từ chối</option><option value="refund_full">Hoàn tiền toàn phần</option><option value="refund_partial">Hoàn tiền một phần</option></select></label>
            {verdict !== "rejected" && <label>Số tiền hoàn (VND)<input type="number" min="0" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} required /></label>}
            <label>Ghi chú xử lý<textarea value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} minLength="5" maxLength="2000" rows="4" required /></label>
            <button className="button" disabled={resolveMutation.isPending}>{resolveMutation.isPending ? "Đang lưu..." : "Giải quyết khiếu nại"}</button>
          </form>
        </>
      )}
      {isAssigned && closed && (
        <div className="package-card admin-conversation-panel">
          <p className="card-kicker">TRAO ĐỔI PHIÊN ĐỌC</p>
          {serviceMessagesQuery.data?.length ? serviceMessagesQuery.data.map((item) => (
            <p key={item.id}><strong>{item.sender_id === dispute.raised_by_id ? "Khách hàng" : "Reader"}:</strong> {item.content}</p>
          )) : <p className="lead">Chưa có tin nhắn phiên đọc.</p>}
        </div>
      )}
    </section>
  );
}
