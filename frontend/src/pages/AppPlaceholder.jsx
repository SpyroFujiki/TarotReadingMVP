import { Link } from "react-router-dom";
export default function AppPlaceholder({ title, description, action, to }) { return <section className="page-section placeholder"><p className="eyebrow">KHU VỰC ỨNG DỤNG</p><h1>{title}</h1><p className="lead">{description}</p>{action && <Link className="button" to={to}>{action}</Link>}</section>; }
