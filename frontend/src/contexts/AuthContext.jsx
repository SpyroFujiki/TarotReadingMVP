import { createContext, useContext, useEffect, useState } from "react";
import { api, authStorage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(Boolean(authStorage.getToken()));

	useEffect(() => {
		if (!authStorage.getToken()) return;
		api.get("/auth/me").then(setUser).catch(() => authStorage.clear()).finally(() => setLoading(false));
	}, []);

	const signIn = async (credentials) => {
		const result = await api.post("/auth/login", credentials);
		authStorage.setToken(result.access_token);
		setUser(result.user);
		return result.user;
	};

	const signUp = async (details) => {
		const result = await api.post("/auth/register", details);
		authStorage.setToken(result.access_token);
		setUser(result.user);
		return result.user;
	};

	const signOut = () => {
		authStorage.clear();
		setUser(null);
	};

	return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}
