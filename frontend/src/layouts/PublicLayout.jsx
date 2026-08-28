import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function PublicLayout() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#001326", color: "#ffffff", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}><Outlet /></main>
    </div>
  );
}
