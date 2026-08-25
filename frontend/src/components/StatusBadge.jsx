const labels = { pending: "Đang chờ", assigned: "Đã nhận", in_progress: "Đang thực hiện", completed: "Hoàn thành", canceled: "Đã hủy", disputing: "Đang khiếu nại", open: "Mở", reviewing: "Đang xem xét", resolved: "Đã giải quyết", rejected: "Từ chối" };

export function StatusBadge({ status }) {
	return <span className={`status status-${status}`}>{labels[status] || status}</span>;
}
