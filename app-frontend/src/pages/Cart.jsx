import { useCart } from '../assets/components/CartContext';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TEXTS } from '../assets/data/texts';
import '../assets/styles/Cart.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://smashly-backend.onrender.com';

function Cart({ setShowPopup, setTimeLeft }) {
  const { cart, setCart } = useCart();
  const [notes, setNotes] = useState(Array(cart.length).fill(''));
  const tableNumber = sessionStorage.getItem('masaCurenta') || '';
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const getRedirectPath = (basePath) => {
    const params = new URLSearchParams(location.search);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const handleNoteChange = (index, value) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = value;
    setNotes(updatedNotes);
  };

  const removeItemFromCart = (indexToRemove) => {
    const updatedCart = cart.filter((_, i) => i !== indexToRemove);
    const updatedNotes = notes.filter((_, i) => i !== indexToRemove);
    setCart(updatedCart);
    setNotes(updatedNotes);
  };

  const displayPopupMessage = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(''), 2500);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const submitOrder = async () => {
    const productsWithId = cart.map((item) => {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      };
    });

    console.log('Trimitem comanda:', {
      tableNumber,
      products: productsWithId,
      totalAmount: total,
      notes,
    });

    try {
      const response = await fetch(`${API_BASE}/api/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber,
          products: productsWithId,
          totalAmount: total,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mesaj || TEXTS.CART.SERVER_ERROR);
      }

      const activeKey = `popupActive_masa_${tableNumber}`;
      const expireKey = `popupExpireAt_masa_${tableNumber}`;
      const estimatedTimeSec = data.order.estimatedTime * 60;

      if (estimatedTimeSec > 0) {
        const expireAt = Date.now() + estimatedTimeSec * 1000;
        sessionStorage.setItem(activeKey, 'true');
        sessionStorage.setItem(expireKey, expireAt.toString());
        setTimeLeft(estimatedTimeSec);
        setShowPopup(true);
        window.dispatchEvent(new CustomEvent('popupTimeUpdated'));
      } else {
        sessionStorage.removeItem(activeKey);
        sessionStorage.removeItem(expireKey);
        setShowPopup(false);
      }

      setCart([]);
      setNotes([]);
      displayPopupMessage(TEXTS.CART.ORDER_SUCCESS);
      setShowPopup(true);
      setTimeLeft(data.order.estimatedTime * 60);

      window.dispatchEvent(new CustomEvent('popupTimeUpdated'));

      navigate(getRedirectPath('/cart'));
    } catch (error) {
      displayPopupMessage(TEXTS.CART.ORDER_ERROR);
    }
  };

  const total = calculateTotal();

  return (
    <div className="cart-background">
      <div className="cart-container">
        <h2 className="cart-title">{TEXTS.CART.TITLE}</h2>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>{TEXTS.CART.EMPTY}</p>
          </div>
        ) : (
          <>
            <div className="cart-table-display">
              {TEXTS.CART.TABLE_DISPLAY} {tableNumber}
            </div>

            {cart.map((product, index) => (
              <div key={index} className="product-card">
                <div className="product-row">
                  <div className="product-image-column">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-details-column">
                    <div className="product-header">
                      <h5 className="product-name">{product.name}</h5>
                      <span className="product-price">
                        {product.price} {TEXTS.GENERAL.CURRENCY}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="product-note-input"
                      placeholder={TEXTS.CART.NOTE_PLACEHOLDER}
                      maxLength={30}
                      value={notes[index] || ''}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                    />
                  </div>
                  <div className="product-remove-column">
                    <button className="remove-button" onClick={() => removeItemFromCart(index)}>
                      {TEXTS.CART.REMOVE}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="total-section">
              {TEXTS.CART.TOTAL}: {total} {TEXTS.GENERAL.CURRENCY}
            </div>

            <div className="submit-section">
              <button className="submit-button" onClick={submitOrder}>
                {TEXTS.CART.SUBMIT}
              </button>
            </div>
          </>
        )}

        {popupMessage && <div className="cart-popup">{popupMessage}</div>}
      </div>
    </div>
  );
}

export default Cart;
