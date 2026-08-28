export const verdictLabels = {
  refund_full: "Hoàn tiền toàn phần",
  refund_partial: "Hoàn tiền một phần",
  rejected: "Từ chối khiếu nại",
};

export const getVerdictLabel = (verdict) =>
  verdictLabels[verdict] || "Chưa có kết luận";

export const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
