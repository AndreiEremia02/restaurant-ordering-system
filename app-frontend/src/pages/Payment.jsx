import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TEXTS } from '../assets/data/texts';
import '../assets/styles/Payment.css';

const confirmImage = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/images/payment-confirmation.png`;

function Payment() {
  const [tableId, setTableId] = useState('');
  const [orders, setOrders] = useState([]);
  const [method, setMethod] = useState('cash');
  const [tip, setTip] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [card, setCard] = useState({ name: '', number: '', expiration: '', cvv: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [showCashNotice, setShowCashNotice] = useState(false);
  const [displaySuccess, setDisplaySuccess] = useState(true);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://smashly-backend.onrender.com';

  useEffect(() => {
    const savedTable = sessionStorage.getItem('masaCurenta');
    if (savedTable) {
      setTableId(savedTable);
      fetchOrders(savedTable);
    } else {
      const params = new URLSearchParams(window.location.search);
      const queryTable = params.get("tableNumber");
      if (queryTable) {
        setTableId(queryTable);
        sessionStorage.setItem("masaCurenta", queryTable);
        fetchOrders(queryTable);
      }
    }
  }, []);

  useEffect(() => {
    if (confirmed && method === 'card') {
      const timer = setTimeout(() => setDisplaySuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [confirmed, method]);

  const fetchOrders = (table) => {
    if (!table) return;
    axios
      .get(`${API_BASE}/api/orders/${table}`)
      .then((res) => setOrders(res.data.orders.filter((o) => o.status !== 'platita')))
      .catch(() => setOrders([]));
  };

  const calculateTotal = () => {
    const base = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const tipValue = Math.round((tip / 100) * base);
    return base + tipValue;
  };

  const handleCardChange = (field, value) => {
    const updated = { ...card, [field]: value };
    const errors = { ...validationErrors };

    if (field === 'name' && !/^[a-zA-Z\s]*$/.test(value)) {
      errors.name = TEXTS.PAYMENT.VALIDATION_NAME;
    } else {
      delete errors.name;
    }

    if (field === 'number' && (!/^[0-9]*$/.test(value) || value.length !== 16)) {
      errors.number = TEXTS.PAYMENT.VALIDATION_NUMBER;
    } else {
      delete errors.number;
    }

    if (field === 'expiration' && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
      errors.expiration = TEXTS.PAYMENT.VALIDATION_EXPIRATION;
    } else {
      delete errors.expiration;
    }

    if (field === 'cvv' && !/^[0-9]{3}$/.test(value)) {
      errors.cvv = TEXTS.PAYMENT.VALIDATION_CVV;
    } else {
      delete errors.cvv;
    }

    setCard(updated);
    setValidationErrors(errors);
  };

  const handlePayment = () => {
    if (method === 'card') {
      const valid =
        Object.keys(validationErrors).length === 0 &&
        card.name &&
        card.number &&
        card.expiration &&
        card.cvv;

      if (!valid) {
        alert(TEXTS.PAYMENT.VALIDATION_ALERT);
        return;
      }
    }

    Promise.all(
      orders.map((order) =>
        axios.post(`${API_BASE}/api/pay`, {
          orderId: order._id,
          paymentMethod: method,
          tipPercentage: tip,
        })
      )
    )
      .then(() => {
        const popupExpireKey = `popupExpireAt_masa_${tableId}`;
        const popupActiveKey = `popupActive_masa_${tableId}`;
        sessionStorage.removeItem(popupExpireKey);
        sessionStorage.removeItem(popupActiveKey);
        sessionStorage.removeItem('masaCurenta');
        window.dispatchEvent(new Event('popupTimeUpdated'));

        if (method === 'cash') {
          setOrders([]);
          setShowCashNotice(true);
          setTimeout(() => setShowCashNotice(false), 4000);
        } else {
          setConfirmed(true);
          setDisplaySuccess(true);
        }
      })
      .catch(() => alert(TEXTS.PAYMENT.PAYMENT_ERROR));
  };

  if (confirmed && method === 'card') {
    return (
      <div className="payment-confirmation-overlay fade-in">
        <img src={confirmImage} alt="Confirmare" />
        <button
          className="btn-back-home"
          onClick={() => {
            const masa = sessionStorage.getItem('masaCurenta');
            const type = masa ? `?tableNumber=${masa}` : '?client=online-customer';
            navigate(`/home${type}`);
          }}
        >
          {TEXTS.PAYMENT.BACK_TO_RESTAURANT}
        </button>
        {displaySuccess && <div className="success-popup show-popup">{TEXTS.PAYMENT.PAYMENT_SUCCESS}</div>}
      </div>
    );
  }

  return (
    <div className="payment-page-wrapper">
      <div className="container payment-page">
        <h2 className="payment-title">{TEXTS.PAYMENT.TITLE}</h2>

        {orders.length > 0 && (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="payment-card mb-4 shadow-sm p-4">
                <div className="card-body">
                  <div className="table-display">MASA {tableId}</div>

                  <h5 className="mb-3 card-title">{TEXTS.PAYMENT.ORDERS}</h5>
                  {orders.map((o, i) => (
                    <p key={i}>{TEXTS.PAYMENT.ORDER_LABEL} #{o._id.slice(-6)}: {o.totalAmount} {TEXTS.GENERAL.CURRENCY}</p>
                  ))}
                  <p className="fw-bold mt-3">{TEXTS.PAYMENT.TABLE_TOTAL}: {calculateTotal()} {TEXTS.GENERAL.CURRENCY}</p>

                  <div className="mb-3">
                    <label>{TEXTS.PAYMENT.PAYMENT_METHOD}</label>
                    <select
                      className="form-select mt-1"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option value="cash">{TEXTS.PAYMENT.CASH}</option>
                      <option value="card">{TEXTS.PAYMENT.CARD}</option>
                    </select>
                  </div>

                  {method === 'card' && (
                    <div className="mb-3">
                      <label>{TEXTS.PAYMENT.CARD_NAME}</label>
                      {validationErrors.name && <div className="text-danger">{validationErrors.name}</div>}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={card.name}
                        onChange={(e) => handleCardChange('name', e.target.value)}
                      />

                      <label className="mt-2">{TEXTS.PAYMENT.CARD_NUMBER}</label>
                      {validationErrors.number && <div className="text-danger">{validationErrors.number}</div>}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Cod de 16 cifre"
                        value={card.number}
                        onChange={(e) => handleCardChange('number', e.target.value)}
                      />

                      <div className="row mt-2">
                        <div className="col">
                          <label>{TEXTS.PAYMENT.EXPIRATION}</label>
                          {validationErrors.expiration && (
                            <div className="text-danger">{validationErrors.expiration}</div>
                          )}
                          <input
                            type="text"
                            className="form-control"
                            placeholder="MM/YY"
                            value={card.expiration}
                            onChange={(e) => handleCardChange('expiration', e.target.value)}
                          />
                        </div>
                        <div className="col">
                          <label>{TEXTS.PAYMENT.CVV}</label>
                          {validationErrors.cvv && <div className="text-danger">{validationErrors.cvv}</div>}
                          <input
                            type="text"
                            className="form-control"
                            placeholder="XXX"
                            value={card.cvv}
                            onChange={(e) => handleCardChange('cvv', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label>{TEXTS.PAYMENT.TIPS}</label>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {[0, 10, 15, 20].map((val) => (
                        <button
                          key={val}
                          className={`btn btn-outline-secondary ${tip === val ? 'active' : ''}`}
                          onClick={() => setTip(val)}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      className="form-control mt-2"
                      value={tip}
                      onChange={(e) => setTip(Number(e.target.value))}
                      placeholder={TEXTS.PAYMENT.CUSTOM_TIP}
                    />
                  </div>

                  <button className="send-payment w-100" onClick={handlePayment}>
                    {TEXTS.PAYMENT.PAY_NOW}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCashNotice && method === 'cash' && (
          <div className="cash-popup">{TEXTS.PAYMENT.CASH_NOTICE}</div>
        )}
      </div>
    </div>
  );
}

export default Payment;
