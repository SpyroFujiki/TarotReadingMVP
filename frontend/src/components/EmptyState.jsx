export function EmptyState({ title, message, children }) {
	return <div className="state-panel"><strong>{title || message || "Chưa có dữ liệu"}</strong>{children && <p>{children}</p>}</div>;
}
