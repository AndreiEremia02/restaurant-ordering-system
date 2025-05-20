import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './assets/components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrdersDashboard from './pages/OrdersDashboard';
import Payment from './pages/Payment';
import OrderPopup from './assets/components/OrderPopup';

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const updatePopup = () => {
      const popupShouldShow = sessionStorage.getItem("popupActive") === "true";
      const storedExpire = parseInt(sessionStorage.getItem("popupExpireAt"), 10);
      const pagesAllowed = ['/', '/menu', '/cart'];

      if (popupShouldShow && pagesAllowed.includes(location.pathname)) {
        const now = Date.now();
        const remaining = storedExpire && storedExpire > now
          ? Math.floor((storedExpire - now) / 1000)
          : 0;

        setTimeLeft(remaining);
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    };

    updatePopup();
    window.addEventListener("popupTimeUpdated", updatePopup);
    return () => window.removeEventListener("popupTimeUpdated", updatePopup);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      {showPopup && (
        <OrderPopup show={showPopup} setShow={setShowPopup} timeLeft={timeLeft} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart setShowPopup={setShowPopup} setTimeLeft={setTimeLeft} />} />
        <Route path="/angajati" element={<OrdersDashboard />} />
        <Route path="/plata" element={<Payment />} />
      </Routes>
    </>
  );
}

export default App;
