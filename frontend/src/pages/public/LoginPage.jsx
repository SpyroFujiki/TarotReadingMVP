import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await signIn({ email, password });

      // Điều hướng thông minh dựa trên Role thực tế trả về từ PostgreSQL
      if (loggedUser?.role === "admin") {
        navigate("/admin");
      } else if (loggedUser?.role === "reader") {
        navigate("/reader/queue");
      } else {
        navigate("/packages");
      }
    } catch (err) {
      setError(
        err?.detail || 
        err?.message || 
        "Email hoặc mật khẩu không chính xác."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        backgroundColor: "#001f3f",
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          padding: "40px 32px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
          textAlign: "left",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#6b7280",
              fontWeight: "600",
            }}
          >
            Chào mừng trở lại
          </span>
          <h1
            className="font-tarot"
            style={{ fontSize: "2.2rem", color: "#001f3f", margin: "8px 0 0 0" }}
          >
            Đăng Nhập
          </h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              padding: "12px 14px",
              borderRadius: "8px",
              fontSize: "0.88rem",
              marginBottom: "20px",
              lineHeight: "1.4",
              border: "1px solid #f87171",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#111827",
              color: "#ffd700",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            {loading ? "Đang xác thực..." : "Đăng nhập ✦"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "0.9rem",
            color: "#4b5563",
          }}
        >
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            style={{
              color: "#001f3f",
              fontWeight: "700",
              textDecoration: "underline",
            }}
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}