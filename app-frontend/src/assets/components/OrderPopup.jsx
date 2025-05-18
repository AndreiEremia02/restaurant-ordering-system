import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/OrderPopup.css';

function OrderPopup({ show, setShow, timeLeft }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isWaiterCalled, setIsWaiterCalled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const tableNumber = parseInt(localStorage.getItem('masaCurenta'), 10) || 1;

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const expireAt = parseInt(localStorage.getItem('popupExpireAt'), 10);
    if (!expireAt || isNaN(expireAt)) return 0;
    const remaining = Math.floor((expireAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    const expireAt = parseInt(localStorage.getItem('popupExpireAt'), 10);
    const stillActive = localStorage.getItem('popupActive') === 'true';

    if (location.pathname === '/plata') {
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
      const newExpire = parseInt(localStorage.getItem('popupExpireAt'), 10);
      const remaining = Math.max(0, Math.floor((newExpire - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    window.addEventListener('popupTimeUpdated', handlePopupUpdate);
    return () => window.removeEventListener('popupTimeUpdated', handlePopupUpdate);
  }, []);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60).toString().padStart(2, '0');
    const seconds = (sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const callWaiter = () => {
    axios
      .post('http://localhost:3000/api/call-waiter', { tableNumber })
      .then(() => {
        setIsWaiterCalled(true);
        const key = `buzz_table_${tableNumber}`;
        const expireTime = Date.now() + 2 * 60 * 1000;
        localStorage.setItem(key, expireTime);
        window.dispatchEvent(new CustomEvent('buzzUpdated'));
      })
      .catch(() => alert('A aparut o eroare la chemarea chelnerului.'));
  };

  if (!show || location.pathname === '/plata') return null;

  return (
    <div className={`order-popup ${isMinimized ? 'minimized' : ''}`}>
      <div className="popup-content">
        <div className="popup-header">
          <h4 className="popup-title">Comanda Ta</h4>
          <button className="btn-minimize" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? '🔼' : '🔽'}
          </button>
        </div>

        {!isMinimized && (
          <>
            <div className="popup-timer">
              {secondsLeft > 0 ? (
                <>
                  Timp de asteptare: <strong>{formatTime(secondsLeft)}</strong>
                </>
              ) : (
                <span className="order-completed-text">Comanda este pe drum</span>
              )}
            </div>

            <div className="popup-buttons">
              <button className="btn-call" onClick={callWaiter} disabled={isWaiterCalled}>
                {isWaiterCalled ? 'Chelner chemat' : 'Cheama Chelner'}
              </button>
              <button className="btn-pay" onClick={() => navigate('/plata')}>
                Plateste
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderPopup;
