import { Link } from "react-router-dom";

export default function ForbiddenPage() { return <section className="center-page"><p className="eyebrow">403</p><h1>Bạn chưa có quyền ở đây</h1><p>Hãy quay lại khu vực phù hợp với tài khoản của bạn.</p><Link className="button" to="/account">Về tài khoản</Link></section>; }
