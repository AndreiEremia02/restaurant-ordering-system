import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import '../../assets/styles/Navbar.css';
import logo from '../../assets/images/brand-logo.png';

function Navbar() {
  const navbarRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const menu = navbarRef.current;
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
    }
  }, [location]);

  const closeMenu = () => {
    const menu = navbarRef.current;
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-light py-2 px-3">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-lg-none" onClick={closeMenu}>
          <img src={logo} alt="SMASHLY Logo" className="navbar-logo-img" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-center d-lg-flex flex-column align-items-center"
          id="navbarNav"
          ref={navbarRef}
        >
          <Link to="/" className="navbar-brand d-none d-lg-block mb-2" onClick={closeMenu}>
            <img src={logo} alt="SMASHLY Logo" className="navbar-logo-img" />
          </Link>

          <ul className="navbar-nav text-center">
            <li className="nav-item">
              <Link className="nav-link" to="/menu" onClick={closeMenu}>Meniu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cart" onClick={closeMenu}>Cos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/plata" onClick={closeMenu}>Plata</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/angajati" onClick={closeMenu}>Comenzi-Active</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
