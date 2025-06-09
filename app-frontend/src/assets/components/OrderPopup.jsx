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

  const tableNumber = parseInt(sessionStorage.getItem('masaCurenta'), 10) || 1;

  const popupExpireKey = `popupExpireAt_masa_${tableNumber}`;
  const popupActiveKey = `popupActive_masa_${tableNumber}`;

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const expireAt = parseInt(sessionStorage.getItem(popupExpireKey), 10);
    if (!expireAt || isNaN(expireAt)) return 0;
    const remaining = Math.floor((expireAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    const expireAt = parseInt(sessionStorage.getItem(popupExpireKey), 10);
    const stillActive = sessionStorage.getItem(popupActiveKey) === 'true';

    if (location.pathname.includes('/payment')) {
      setShow(false);
    } else if (stillActive && expireAt > Date.now()) {
      setShow(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!show) return;
    setSecondsLeft(timeLeft);
  }, [timeLeft, show]);

  useEffect(() => {
    if (!show || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [show, secondsLeft]);

  useEffect(() => {
    const handlePopupUpdate = () => {
      updatePopupTimer();
    };

    window.addEventListener('popupTimeUpdated', handlePopupUpdate);
    return () => window.removeEventListener('popupTimeUpdated', handlePopupUpdate);
  }, []);

  const updatePopupTimer = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${tableNumber}`);
      const orders = res.data.orders;

      const now = Date.now();

      let totalRemainingSeconds = 0;

      for (let order of orders) {
        if (order.status !== 'livrat' && order.estimatedTime) {
          const createdAt = new Date(order.createdAt).getTime();
          const expireAt = createdAt + order.estimatedTime * 60000;
          const remaining = Math.floor((expireAt - now) / 1000);
          totalRemainingSeconds += remaining > 0 ? remaining : 0;
        }
      }

      const newExpire = now + totalRemainingSeconds * 1000;
      sessionStorage.setItem(popupExpireKey, newExpire.toString());
      sessionStorage.setItem(popupActiveKey, 'true');

      setSecondsLeft(totalRemainingSeconds);
    } catch (err) {
      console.error('Eroare la actualizarea timpului', err);
    }
  };

  const formatTime = (sec) => {
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
        window.dispatchEvent(new CustomEvent('buzzUpdated'));
      })
      .catch(() => alert(TEXTS.ORDER_POPUP.ERROR_CALL_WAITER));
  };

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
              {secondsLeft > 0 ? (
                <>
                  {TEXTS.ORDER_POPUP.TIME_LABEL} <strong>{formatTime(secondsLeft)}</strong>
                </>
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
                  const masa = sessionStorage.getItem("masaCurenta");
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
