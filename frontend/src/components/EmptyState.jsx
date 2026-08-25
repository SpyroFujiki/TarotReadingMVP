export function EmptyState({ title = "Chưa có dữ liệu", children }) {
	return <div className="state-panel"><strong>{title}</strong>{children && <p>{children}</p>}</div>;
}
