import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AuthForm } from "./LoginPage";

export default function RegisterPage() { const { signUp } = useAuth(); const navigate = useNavigate(); const [form, setForm] = useState({ email: "", full_name: "", password: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await signUp(form); navigate("/account", { replace: true }); } catch (reason) { setError(reason.message); } finally { setBusy(false); } }; return <AuthForm title="Bắt đầu hành trình" hint="Tạo tài khoản customer miễn phí." onSubmit={submit} error={error} busy={busy} fields={[{ name: "full_name", label: "Họ và tên", type: "text" }, { name: "email", label: "Email", type: "email" }, { name: "password", label: "Mật khẩu", type: "password" }]} form={form} setForm={setForm}><p className="form-footer">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></AuthForm>; }
