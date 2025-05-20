import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/styles/Home.css";
import burgerDesktop from "../assets/images/home-banner-desktop.png";
import burger1 from "../assets/images/home-banner-mobile-1.png";
import burger2 from "../assets/images/home-banner-mobile-2.png";
import burger3 from "../assets/images/home-banner-mobile-3.png";

function Home() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    if (!sessionStorage.getItem('masaCurenta')) {
      if (params.has('tableNumber')) {
        const numberFromQuery = params.get('tableNumber');
        console.log("Setam masaCurenta din query param:", numberFromQuery);
        sessionStorage.setItem('masaCurenta', numberFromQuery);
      } else if (hash.includes('#')) {
        const match = hash.match(/#(\d+)/);
        if (match) {
          console.log("Setam masaCurenta din hash:", match[1]);
          sessionStorage.setItem('masaCurenta', match[1]);
        }
      }
    }
  }, []);

  return (
    <div className="hero-section">
      <h1 className="hero-title">GATIT PROASPAT, PE LOC!</h1>

      <div className="burger-mobile-container d-lg-none">
        <div className="burger-item">
          <img src={burger1} alt="Double Cheeseburger" className="burger-mobile-img" />
          <p className="burger-name">Double Cheeseburger</p>
        </div>
        <div className="burger-item">
          <img src={burger2} alt="Fried Chicken Burger" className="burger-mobile-img" />
          <p className="burger-name">Fried Chicken Burger</p>
        </div>
        <div className="burger-item">
          <img src={burger3} alt="Philly Cheeseburger" className="burger-mobile-img" />
          <p className="burger-name">Philly Cheeseburger</p>
        </div>
      </div>

      <picture className="d-none d-lg-block">
        <img src={burgerDesktop} alt="burger" className="hero-image" />
      </picture>

      <Link to="/menu" className="home-menu-button">Meniu</Link>
    </div>
  );
}

export default Home;
