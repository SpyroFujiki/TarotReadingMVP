import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const cardAssets = import.meta.glob("../../assets/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
  query: "?url",
});

const tarotCards = Object.entries(cardAssets)
  .filter(([path]) => /(?:The|Cups|Wands|Swords|Pentacles)/.test(path))
  .map(([, source]) => source);

function getRandomCard() {
  return tarotCards[Math.floor(Math.random() * tarotCards.length)] || cardAssets["../../assets/00-TheFool.png"];
}

export default function HomePage() {
  const [randomCard, setRandomCard] = useState(getRandomCard);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    const image = new Image();
    image.src = randomCard;
    image.onload = () => setIsLoaded(true);
    image.onerror = () => {
      setRandomCard(cardAssets["../../assets/00-TheFool.png"]);
      setIsLoaded(true);
    };
  }, [randomCard]);

  return <section id="homepage" className="hero">
    <header className="home-header">
      <h1 className="main-title-text">CHÀO MỪNG BẠN ĐẾN VỚI<br /><span className="brand-accent">SPYRO TARO</span></h1>
      <button className={`card-display-area ${isLoaded ? "loaded" : ""}`} onClick={() => setRandomCard(getRandomCard)} aria-label="Rút một lá bài khác">
        {!isLoaded && <span className="card-loader"><span className="shimmer" /></span>}
        <img className={`hero-card-img ${isLoaded ? "visible" : "hidden"}`} src={randomCard} alt="Lá bài tarot được rút ngẫu nhiên" />
      </button>
      <h2 className="sub-title-text">Gỡ rối hiện tại — Mở lối tương lai</h2>
    </header>
    <main className="home-main-flex">
      <Link to="/packages" className="home-box"><h3 className="home-title">Các gói dịch vụ</h3><p className="home-desc">Khám phá các gói trải bài được thiết kế để thấu hiểu từng góc khuất trong tâm hồn bạn.</p><span className="box-footer-link">Xem chi tiết ◈</span></Link>
      <Link to="/register" className="home-box"><h3 className="home-title">Bắt đầu hành trình</h3><p className="home-desc">Tạo tài khoản để gửi chủ đề và kết nối với reader phù hợp.</p><span className="box-footer-link">Đăng ký ngay ◈</span></Link>
    </main>
  </section>;
}
