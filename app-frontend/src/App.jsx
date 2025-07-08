import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './assets/components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrdersDashboard from './pages/OrdersDashboard';
import Statistics from './pages/Statistics';
import Payment from './pages/Payment';
import OrderPopup from './assets/components/OrderPopup';
import Footer from './assets/components/Footer';
import Login from './pages/Login';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const isAtTable = params.has('tableNumber');
  const isEmployee = location.pathname === '/employee';
  const hideFooter = isEmployee;

  useEffect(() => {
    const tableParam = params.get('tableNumber');
    if (tableParam) {
      sessionStorage.setItem('masaCurenta', tableParam);
    }
  }, [location.search]);

  const checkActiveOrders = async () => {
    const tableNumber = sessionStorage.getItem('masaCurenta');
    const popupExpireKey = `popupExpireAt_masa_${tableNumber}`;
    const popupActiveKey = `popupActive_masa_${tableNumber}`;
    const now = Date.now();

    if (!tableNumber) return;

    try {
      const res = await axios.get(`${API_BASE}/api/orders/${tableNumber}`);
      const orders = res.data.orders;
      const unpaidOrders = orders.filter(order => order.status !== 'platita');

      if (unpaidOrders.length === 0 || location.pathname.includes('/payment')) {
        sessionStorage.removeItem(popupExpireKey);
        sessionStorage.removeItem(popupActiveKey);
        setTimeLeft(0);
        setShowPopup(false);
        return;
      }

      setShowPopup(true);
      sessionStorage.setItem(popupActiveKey, 'true');

      let totalRemaining = 0;
      for (let order of unpaidOrders) {
        if (order.status !== 'livrat' && order.estimatedTime > 0) {
          const createdAt = new Date(order.createdAt).getTime();
          const expireAt = createdAt + order.estimatedTime * 60000;
          const remaining = Math.floor((expireAt - now) / 1000);
          totalRemaining += remaining > 0 ? remaining : 0;
        }
      }

      setTimeLeft(totalRemaining);
      if (totalRemaining > 0) {
        sessionStorage.setItem(popupExpireKey, (now + totalRemaining * 1000).toString());
      } else {
        sessionStorage.setItem(popupExpireKey, now.toString());
      }

    } catch (err) {}
  };

  useEffect(() => {
    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  useEffect(() => {
    const handlePopupUpdate = () => {
      checkActiveOrders();
    };
    window.addEventListener('popupTimeUpdated', handlePopupUpdate);
    return () => window.removeEventListener('popupTimeUpdated', handlePopupUpdate);
  }, []);

  const shouldShowPopup = () => {
    const isPopupPage = ["/home", "/menu", "/cart"].some(p => location.pathname.startsWith(p));
    const tableNumber = sessionStorage.getItem('masaCurenta');
    const popupActive = sessionStorage.getItem(`popupActive_masa_${tableNumber}`) === 'true';
    const popupExpireAt = parseInt(sessionStorage.getItem(`popupExpireAt_masa_${tableNumber}`), 10);
    const now = Date.now();

    return Boolean(
      isPopupPage &&
      !location.pathname.includes('/payment') &&
      (
        popupActive ||
        (popupExpireAt && popupExpireAt > now)
      )
    );
  };

  return (
    <>
      <Navbar isAtTable={isAtTable} isEmployee={isEmployee} />
      {Boolean(shouldShowPopup()) && !isNaN(timeLeft) && timeLeft >= 0 && (
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
        <Route path="/employee/:id" element={<OrdersDashboard />} />
        <Route path="/employee/:id/stats" element={<Statistics />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
