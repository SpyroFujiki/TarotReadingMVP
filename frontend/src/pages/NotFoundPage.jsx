import { Link } from "react-router-dom";

export default function NotFoundPage() { return <section className="center-page"><p className="eyebrow">404</p><h1>Trang này không tồn tại</h1><Link className="button" to="/">Về trang chủ</Link></section>; }
