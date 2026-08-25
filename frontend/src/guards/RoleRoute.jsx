import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const rank = { customer: 1, reader: 2, admin: 3 };

export function RoleRoute({ minimumRole }) {
	const { user } = useAuth();
	return rank[user?.role] >= rank[minimumRole] ? <Outlet /> : <Navigate to="/403" replace />;
}
