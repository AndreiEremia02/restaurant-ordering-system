import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './assets/components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrdersDashboard from './pages/OrdersDashboard';
import Payment from './pages/Payment';
import OrderPopup from './assets/components/OrderPopup';
import Footer from './assets/components/Footer';

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const isAtTable = params.has("tableNumber");
  const isEmployee = location.pathname === "/employee";
  const hideFooter = isEmployee;

  useEffect(() => {
    const tableParam = params.get("tableNumber");
    if (tableParam) {
      sessionStorage.setItem("masaCurenta", tableParam);
    }
  }, [location.search]);

  useEffect(() => {
    const tableNumber = sessionStorage.getItem("masaCurenta");
    const popupExpireKey = `popupExpireAt_masa_${tableNumber}`;
    const popupActiveKey = `popupActive_masa_${tableNumber}`;

    const updatePopup = () => {
      const popupShouldShow = sessionStorage.getItem(popupActiveKey) === "true";
      const storedExpire = parseInt(sessionStorage.getItem(popupExpireKey), 10);
      const now = Date.now();
      const remaining = storedExpire && storedExpire > now
        ? Math.floor((storedExpire - now) / 1000)
        : 0;

      if (popupShouldShow && remaining > 0 && !location.pathname.includes("/payment")) {
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
      <Navbar isAtTable={isAtTable} isEmployee={isEmployee} />
      {showPopup && (
        <OrderPopup show={showPopup} setShow={setShowPopup} timeLeft={timeLeft} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/home/online-customer" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/online-customer" element={<Menu />} />
        <Route path="/cart" element={<Cart setShowPopup={setShowPopup} setTimeLeft={setTimeLeft} />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/employee" element={<OrdersDashboard />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
