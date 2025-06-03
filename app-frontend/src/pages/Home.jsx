import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/styles/Home.css";
import menuData from "../assets/data/menuData";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes("/online-customer")) {
      sessionStorage.removeItem("masaCurenta");
    } else {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      if (!sessionStorage.getItem('masaCurenta')) {
        if (params.has('tableNumber')) {
          const numberFromQuery = params.get('tableNumber');
          sessionStorage.setItem('masaCurenta', numberFromQuery);
        } else if (hash.includes('#')) {
          const match = hash.match(/#(\d+)/);
          if (match) {
            sessionStorage.setItem('masaCurenta', match[1]);
          }
        }
      }
    }
  }, [location.pathname]);

  const isOnlineCustomer = location.pathname.includes("/online-customer");
  const masaCurenta = sessionStorage.getItem("masaCurenta");
  const menuPath = isOnlineCustomer ? "/menu/online-customer" : `/menu${masaCurenta ? `?tableNumber=${masaCurenta}` : ""}`;

  const burgers = menuData.find(cat => cat.category === "Burgers")?.products.slice(0, 3) || [];

  return (
    <div className="hero-section">
      <h1 className="hero-title">GATIT PROASPAT, PE LOC!</h1>

      <div className="burger-mobile-container d-lg-none">
        {burgers.map((burger, index) => (
          <div key={index} className="burger-item">
            <img src={burger.image} alt={burger.name} className="burger-mobile-img" />
            <p className="burger-name">{burger.name}</p>
          </div>
        ))}
      </div>

      <picture className="d-none d-lg-block">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/images/home-banner-desktop.png`}
          alt="burger"
          className="hero-image"
        />
      </picture>

      <Link to={menuPath} className="home-menu-button">Meniu</Link>
    </div>
  );
}

export default Home;
