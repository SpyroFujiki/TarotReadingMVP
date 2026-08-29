import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../api/client";

const PASSWORD_RULES = [
  {
    id: "length",
    label: "Ít nhất 8 ký tự",
    test: (value) => value.length >= 8,
  },
  {
    id: "upper",
    label: "Ít nhất 1 chữ hoa (A-Z)",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lower",
    label: "Ít nhất 1 chữ thường (a-z)",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "digit",
    label: "Ít nhất 1 chữ số (0-9)",
    test: (value) => /\d/.test(value),
  },
  {
    id: "special",
    label: "Ít nhất 1 ký tự đặc biệt (!@#$%...)",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const ruleResults = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        ...rule,
        passed: rule.test(password),
      })),
    [password],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const failedRule = ruleResults.find((rule) => !rule.passed);
    if (failedRule) {
      setError(`Mật khẩu chưa đủ điều kiện: ${failedRule.label.toLowerCase()}.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      await signUp({ name, email, password, confirmPassword });
      navigate("/account");
    } catch (err) {
      setError(getApiErrorMessage(err, "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!"));
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
              disabled={loading}
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
              disabled={loading}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
              style={inputStyle}
            />
            <ul style={{ listStyle: "none", margin: "10px 0 0 0", padding: 0 }}>
              {ruleResults.map((rule) => (
                <li
                  key={rule.id}
                  style={{
                    fontSize: "0.8rem",
                    color: password ? (rule.passed ? "#15803d" : "#b91c1c") : "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  {password ? (rule.passed ? "✓" : "✕") : "•"} {rule.label}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
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
