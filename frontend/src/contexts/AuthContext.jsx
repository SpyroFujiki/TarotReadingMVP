import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, register as registerApi, getMe as getMeApi } from "../api/authApi";
import { authStorage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [loading, setLoading] = useState(true);

  // Tự động đồng bộ thông tin user khi load lại trang nếu có token
  useEffect(() => {
    async function loadUser() {
      const token = authStorage.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await getMeApi();
        setUser(currentUser);
        authStorage.setUser(currentUser);
      } catch (err) {
        authStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = async ({ email, password }) => {
    const res = await loginApi({ email, password });
    // Backend trả về: { access_token: "...", user: { id, email, full_name, role, status } }
    authStorage.setToken(res.access_token);
    authStorage.setUser(res.user);
    setUser(res.user);
    return res.user;
  };

  const signUp = async ({ name, email, password, confirmPassword }) => {
    const res = await registerApi({
      email,
      password,
      confirm_password: confirmPassword ?? password,
      full_name: name,
    });
    authStorage.setToken(res.access_token);
    authStorage.setUser(res.user);
    setUser(res.user);
    return res.user;
  };

  const signOut = () => {
    authStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);