export function ErrorState({ message = "Không thể tải dữ liệu." }) {
	return <div className="state-panel error-state"><strong>Đã có lỗi</strong><p>{message}</p></div>;
}
