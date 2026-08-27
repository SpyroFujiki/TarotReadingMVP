import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await signIn({ email, password });
      navigate("/");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div style={{ backgroundColor: "#001f3f", minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      
      {/* Khung Card bo tròn lớn giống ảnh mẫu */}
      <div style={{
        backgroundColor: "#ffffff",
        color: "#1a1a1a",
        width: "100%",
        maxWidth: "480px",
        borderRadius: "32px",
        padding: "50px 40px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
        textAlign: "center"
      }}>
        
        <div style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#777777", marginBottom: "10px", fontWeight: "600" }}>
          Lá bài vũ trụ
        </div>
        
        <h1 className="font-tarot" style={{ fontSize: "2.5rem", fontWeight: "normal", color: "#1a1a1a", marginBottom: "10px" }}>
          Welcome back
        </h1>
        <p style={{ color: "#666666", fontSize: "0.95rem", marginBottom: "35px" }}>
          Đăng nhập để tiếp tục hành trình khám phá của bạn.
        </p>

        {error && (
          <div style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "12px", borderRadius: "10px", fontSize: "0.9rem", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#444444", marginBottom: "8px" }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
              required
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "14px",
                border: "1px solid #dddddd",
                backgroundColor: "#fafafa",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#1a1a1a"}
              onBlur={(e) => e.target.style.borderColor = "#dddddd"}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#444444", marginBottom: "8px" }}>Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "14px",
                border: "1px solid #dddddd",
                backgroundColor: "#fafafa",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#1a1a1a"}
              onBlur={(e) => e.target.style.borderColor = "#dddddd"}
            />
          </div>

          <button 
            type="submit" 
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "15px",
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              borderRadius: "14px",
              border: "none",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
              transition: "opacity 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.opacity = "0.9"}
            onMouseLeave={(e) => e.target.style.opacity = "1"}
          >
            Đăng nhập ✦
          </button>
        </form>

        <div style={{ marginTop: "30px", fontSize: "0.95rem", color: "#666666" }}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={{ color: "#1a1a1a", fontWeight: "bold", textDecoration: "underline" }}>
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
}