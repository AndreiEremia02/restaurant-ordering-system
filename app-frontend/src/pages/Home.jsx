import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TEXTS } from '../assets/data/texts';
import "../assets/styles/Home.css";
import menuData from "../assets/data/menuData";

function Home() {
  const location = useLocation();
  const [menuPath, setMenuPath] = useState("");

  useEffect(() => {
    if (location.pathname.includes("/online-customer")) {
      sessionStorage.removeItem("masaCurenta");
      setMenuPath("/menu/online-customer");
    } else {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      let table = sessionStorage.getItem("masaCurenta");
      if (!table) {
        if (params.has("tableNumber")) {
          table = params.get("tableNumber");
          sessionStorage.setItem("masaCurenta", table);
        } else if (hash.includes("#")) {
          const match = hash.match(/#(\d+)/);
          if (match) {
            table = match[1];
            sessionStorage.setItem("masaCurenta", table);
          }
        }
      }

      setMenuPath(table ? `/menu?tableNumber=${table}` : "/menu");
    }
  }, [location.pathname]);

  const burgers = menuData.find(cat => cat.category === "Burgers")?.products.slice(0, 3) || [];

  return (
    <div className="hero-section">
      <h1 className="hero-title">{TEXTS.HOME.TITLE}</h1>

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

      {menuPath && (
        <Link to={menuPath} className="home-menu-button">
          {TEXTS.HOME.MENU_BUTTON}
        </Link>
      )}
    </div>
  );
}

export default Home;
