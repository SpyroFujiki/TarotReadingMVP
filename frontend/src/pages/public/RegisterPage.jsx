import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp({ name, email, password });
      navigate("/account");
    } catch (err) {
      setError(err?.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!");
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
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  };

  return (
    <div style={{ backgroundColor: "#001f3f", minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "40px 32px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
        textAlign: "left",
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "2px", color: "#6b7280", fontWeight: "600" }}>
            Lá bài vũ trụ
          </span>
          <h1 className="font-tarot" style={{ fontSize: "2.2rem", color: "#001f3f", margin: "8px 0 0 0" }}>
            Bắt đầu hành trình
          </h1>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "0.88rem", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Họ và tên</label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản ✦"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "#4b5563" }}>
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ color: "#001f3f", fontWeight: "700", textDecoration: "underline" }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}