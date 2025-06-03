import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import '../../assets/styles/Navbar.css';

const logo = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/images/brand-logo.png`;

function Navbar({ isAtTable, isEmployee }) {
  const navbarRef = useRef();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const queryString = params.toString();
  let suffix = '';
  if (location.pathname.includes('/online-customer')) {
    suffix = '/online-customer';
  } else if (queryString) {
    suffix = `?${queryString}`;
  }

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

  const renderNavLinks = () => {
    if (isEmployee || (!isAtTable && location.pathname !== '/')) return null;

    if (isAtTable) {
      return (
        <>
          <li className="nav-item">
            <Link className="nav-link" to={`/menu${suffix}`} onClick={closeMenu}>Meniu</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/cart${suffix}`} onClick={closeMenu}>Cos</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/payment${suffix}`} onClick={closeMenu}>Plata</Link>
          </li>
        </>
      );
    }

    return null;
  };

  const shouldShowHamburger = isAtTable;

  return (
    <nav className="navbar navbar-expand-lg bg-light py-2 px-3">
      <div className="container-fluid">
        {isEmployee ? (
          <span className="navbar-brand d-lg-none">
            <img src={logo} alt="SMASHLY Logo" className="navbar-logo-img" />
          </span>
        ) : (
          <Link to={`/home${suffix}`} className="navbar-brand d-lg-none" onClick={closeMenu}>
            <img src={logo} alt="SMASHLY Logo" className="navbar-logo-img" />
          </Link>
        )}

        {shouldShowHamburger && (
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
        )}

        <div
          className="collapse navbar-collapse justify-content-center d-lg-flex flex-column align-items-center"
          id="navbarNav"
          ref={navbarRef}
        >
          {isEmployee ? (
            <span className="navbar-brand d-none d-lg-block mb-2">
              <img src={logo} alt="SMASHLY Logo" className="navbar-logo-img" />
            </span>
          ) : (
            <Link to={`/home${suffix}`} className="navbar-brand d-none d-lg-block mb-2" onClick={closeMenu}>
              <img src={logo} alt="SMASHLY Logo" className="navbar-logo-img" />
            </Link>
          )}

          <ul className="navbar-nav text-center">
            {renderNavLinks()}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
