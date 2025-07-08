import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TEXTS } from '../data/texts';
import '../styles/OrderPopup.css';

function OrderPopup({ show, setShow, timeLeft }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isWaiterCalled, setIsWaiterCalled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeLeft);
  const [allDelivered, setAllDelivered] = useState(false);

  const tableNumber = parseInt(sessionStorage.getItem('masaCurenta'), 10) || 1;
  const popupExpireKey = `popupExpireAt_masa_${tableNumber}`;
  const popupActiveKey = `popupActive_masa_${tableNumber}`;

  useEffect(() => {
    const expireAt = parseInt(sessionStorage.getItem(popupExpireKey), 10);
    const stillActive = sessionStorage.getItem(popupActiveKey) === 'true';
    if (location.pathname.includes('/payment')) {
      setShow(false);
    } else if ((stillActive && expireAt > Date.now()) || allDelivered) {
      const remaining = Math.floor((expireAt - Date.now()) / 1000);
      setSecondsLeft(remaining > 0 ? remaining : 0);
      setShow(true);
    } else {
      setShow(false);
    }
  }, [location.pathname, allDelivered]);

  useEffect(() => {
    if (!show) return;
    if (timeLeft > 0) {
      setSecondsLeft(timeLeft);
    } else {
      const storedExpire = parseInt(sessionStorage.getItem(popupExpireKey), 10);
      const remaining = Math.floor((storedExpire - Date.now()) / 1000);
      setSecondsLeft(remaining > 0 ? remaining : 0);
    }
  }, [timeLeft, show]);

  useEffect(() => {
    if (!show || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [show, secondsLeft]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${tableNumber}?forClient=true`);
        const orders = res.data.orders;
        const unpaidOrders = orders.filter(order => order.status !== 'platita');
        if (unpaidOrders.length === 0) {
          sessionStorage.removeItem(popupExpireKey);
          sessionStorage.removeItem(popupActiveKey);
          setSecondsLeft(0);
          setShow(false);
        } else {
          const allAreDelivered = unpaidOrders.every(order => order.status === 'livrat');
          setAllDelivered(allAreDelivered);
          setShow(true);
        }
      } catch (err) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [tableNumber]);

  useEffect(() => {
    const handlePopupUpdate = () => {
      const expireAt = parseInt(sessionStorage.getItem(popupExpireKey), 10);
      const stillActive = sessionStorage.getItem(popupActiveKey) === 'true';
      if (stillActive && expireAt > Date.now()) {
        const remaining = Math.floor((expireAt - Date.now()) / 1000);
        setSecondsLeft(remaining > 0 ? remaining : 0);
        setAllDelivered(false);
        setShow(true);
      } else {
        setAllDelivered(true);
        setShow(true);
      }
    };
    window.addEventListener('popupTimeUpdated', handlePopupUpdate);
    return () => window.removeEventListener('popupTimeUpdated', handlePopupUpdate);
  }, []);

  const formatTime = (sec) => {
    if (isNaN(sec) || sec < 0) return '00:00';
    const minutes = Math.floor(sec / 60).toString().padStart(2, '0');
    const seconds = (sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const callWaiter = () => {
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/call-waiter`, { tableNumber })
      .then(() => {
        setIsWaiterCalled(true);
        const key = `buzz_table_${tableNumber}`;
        const expireTime = Date.now() + 2 * 60 * 1000;
        sessionStorage.setItem(key, expireTime);
      })
      .catch(() => alert(TEXTS.ORDER_POPUP.ERROR_CALL_WAITER));
  };

  useEffect(() => {
    const key = `buzz_table_${tableNumber}`;
    const expire = parseInt(sessionStorage.getItem(key), 10);
    if (expire && expire > Date.now()) {
      setIsWaiterCalled(true);
      const interval = setInterval(() => {
        const now = Date.now();
        if (parseInt(sessionStorage.getItem(key), 10) <= now) {
          setIsWaiterCalled(false);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsWaiterCalled(false);
    }
  }, [tableNumber]);

  if (!show || location.pathname.includes('/payment')) return null;

  return (
    <div className={`order-popup ${isMinimized ? 'minimized' : ''}`}>
      <div className="popup-content">
        <div className="popup-header">
          <h4 className="popup-title">{TEXTS.ORDER_POPUP.TITLE}</h4>
          <button className="btn-minimize" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? '🔼' : '🔽'}
          </button>
        </div>
        {!isMinimized && (
          <>
            <div className="popup-timer">
              {(secondsLeft > 0 && !allDelivered) ? (
                <span>
                  {TEXTS.ORDER_POPUP.TIME_LABEL}{' '}
                  <strong>{formatTime(secondsLeft)}</strong>
                </span>
              ) : (
                <span className="order-completed-text">{TEXTS.ORDER_POPUP.ORDER_COMPLETE}</span>
              )}
            </div>
            <div className="popup-buttons">
              <button className="btn-call" onClick={callWaiter} disabled={isWaiterCalled}>
                {isWaiterCalled ? TEXTS.ORDER_POPUP.CALLED : TEXTS.ORDER_POPUP.CALL}
              </button>
              <button
                className="btn-pay"
                onClick={() => {
                  const masa = sessionStorage.getItem('masaCurenta');
                  navigate(`/payment?tableNumber=${masa}`);
                }}
              >
                {TEXTS.ORDER_POPUP.PAY}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderPopup;
