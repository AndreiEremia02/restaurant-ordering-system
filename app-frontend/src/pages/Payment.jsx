import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Payment.css';
import confirmImage from '../assets/images/payment-confirmation.png';

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
  useEffect(() => {
    const savedTable = sessionStorage.getItem('masaCurenta');
    if (savedTable) setTableId(savedTable);
  }, []);

  useEffect(() => {
    if (confirmed && method === 'card') {
      const timer = setTimeout(() => setDisplaySuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [confirmed, method]);

  const fetchOrders = () => {
    if (!tableId) return;
    axios.get(`https://smashly-backend.onrender.com/api/orders/${tableId}`)
      .then(res => setOrders(res.data.orders.filter(o => o.status !== 'platita')))
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
      errors.name = 'Numele nu trebuie sa contina cifre.';
    } else {
      delete errors.name;
    }

    if (field === 'number' && (!/^[0-9]*$/.test(value) || value.length !== 16)) {
      errors.number = 'Numarul cardului trebuie sa contina exact 16 cifre.';
    } else {
      delete errors.number;
    }

    if (field === 'expiration' && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
      errors.expiration = 'Formatul expirarii este MM/YY.';
    } else {
      delete errors.expiration;
    }

    if (field === 'cvv' && !/^[0-9]{3}$/.test(value)) {
      errors.cvv = 'CVV trebuie sa contina exact 3 cifre.';
    } else {
      delete errors.cvv;
    }

    setCard(updated);
    setValidationErrors(errors);
  };

  const handlePayment = () => {
    if (method === 'card') {
      const valid = Object.keys(validationErrors).length === 0 &&
        card.name && card.number && card.expiration && card.cvv;

      if (!valid) {
        alert("Te rugam sa completezi corect toate campurile.");
        return;
      }
    }

    Promise.all(orders.map(order =>
      axios.post('https://smashly-backend.onrender.com/api/pay', {
        orderId: order._id,
        paymentMethod: method,
        tipPercentage: tip
      })
    ))
      .then(() => {
        sessionStorage.removeItem("popupActive");
        sessionStorage.removeItem("popupExpireAt");
        sessionStorage.removeItem("masaCurenta");

        if (method === 'cash') {
          setOrders([]);
          setShowCashNotice(true);
          setTimeout(() => setShowCashNotice(false), 4000);
        } else {
          setConfirmed(true);
          setDisplaySuccess(true);
        }
      })
      .catch(() => alert('Eroare la plata.'));
  };

  if (confirmed && method === 'card') {
    return (
      <div className="payment-confirmation-overlay fade-in">
        <img src={confirmImage} alt="Confirmare" />
        <button className="btn-back-home" onClick={() => navigate('/')}>
          Intoarce-te pe pagina restaurantului
        </button>
        {displaySuccess && <div className="success-popup show-popup">Plata efectuata cu succes</div>}
      </div>
    );
  }

  return (
    <div className="payment-page-wrapper">
      <div className="container payment-page">
        <h2 className="payment-title">Plata comanda</h2>

        <div className="row justify-content-center mb-4">
          <div className="col-md-6">
            <label>Numar masa:</label>
            <input
              type="number"
              className="form-control"
              value={tableId}
              onChange={(e) => {
                if (!sessionStorage.getItem("masaCurenta")) {
                  setTableId(e.target.value);
                }
              }}
              readOnly={!!sessionStorage.getItem("masaCurenta")}
            />
            <button className="btn btn-primary mt-2 w-100" onClick={fetchOrders}>
              Vezi comenzile
            </button>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="payment-card mb-4 shadow-sm p-4">
                <div className="card-body">
                  <h5 className="mb-3 card-title">Comenzi:</h5>
                  {orders.map((o, i) => (
                    <p key={i}>Comanda #{o._id.slice(-6)}: {o.totalAmount} RON</p>
                  ))}
                  <p className="fw-bold mt-3">Total masa: {calculateTotal()} RON</p>

                  <div className="mb-3">
                    <label>Metoda de plata:</label>
                    <select
                      className="form-select mt-1"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  {method === 'card' && (
                    <div className="mb-3">
                      <label>Nume de pe card:</label>
                      {validationErrors.name && <div className="text-danger">{validationErrors.name}</div>}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={card.name}
                        onChange={(e) => handleCardChange('name', e.target.value)}
                      />

                      <label className="mt-2">Numar card:</label>
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
                          <label>Expirare:</label>
                          {validationErrors.expiration && <div className="text-danger">{validationErrors.expiration}</div>}
                          <input
                            type="text"
                            className="form-control"
                            placeholder="MM/YY"
                            value={card.expiration}
                            onChange={(e) => handleCardChange('expiration', e.target.value)}
                          />
                        </div>
                        <div className="col">
                          <label>CVV:</label>
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
                    <label>Tips:</label>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {[0, 10, 15, 20].map(val => (
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
                      placeholder="Alt procent"
                    />
                  </div>

                  <button className="send-payment w-100" onClick={handlePayment}>
                    Plateste Nota
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCashNotice && method === 'cash' && (
          <div className="cash-popup">Chelnerul soseste imediat</div>
        )}
      </div>
    </div>
  );
}

export default Payment;
