import { useCart } from '../assets/components/CartContext';
import { useState } from 'react';
import '../assets/styles/Cart.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://smashly-backend.onrender.com/api';

function Cart({ setShowPopup, setTimeLeft }) {
  const { cart, setCart } = useCart();
  const [notes, setNotes] = useState(Array(cart.length).fill(''));
  const [tableNumber, setTableNumber] = useState(localStorage.getItem('masaCurenta') || '');
  const [popupMessage, setPopupMessage] = useState('');

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
    return cart.reduce((sum, item) => sum + item.pret, 0);
  };

  const submitOrder = async () => {
    try {
      const response = await fetch(`${API_BASE}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber,
          products: cart,
          totalAmount: total,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mesaj || 'Server error');
      }

      localStorage.setItem('popupActive', 'true');
      localStorage.setItem('popupExpireAt', Date.now() + data.order.estimatedTime * 60000);

      setCart([]);
      setNotes([]);
      displayPopupMessage('Comanda a fost trimisa cu succes!');
      setShowPopup(true);
      setTimeLeft(data.order.estimatedTime * 60);
    } catch (error) {
      console.error('Error submitting order:', error);
      displayPopupMessage('Eroare la trimiterea comenzii.');
    }
  };

  const total = calculateTotal();

  return (
    <div className="cart-background">
      <div className="cart-container">
        <h2 className="cart-title">COSUL TAU</h2>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Cosul este gol.</p>
          </div>
        ) : (
          <>
            {cart.map((product, index) => (
              <div key={index} className="product-card">
                <div className="product-row">
                  <div className="product-image-column">
                    <img
                      src={product.imagine}
                      alt={product.nume}
                      className="product-image"
                    />
                  </div>
                  <div className="product-details-column">
                    <div className="product-header">
                      <h5 className="product-name">{product.nume}</h5>
                      <span className="product-price">{product.pret} RON</span>
                    </div>
                    <input
                      type="text"
                      className="product-note-input"
                      placeholder="Specificatii..."
                      maxLength={30}
                      value={notes[index] || ''}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                    />
                  </div>
                  <div className="product-remove-column">
                    <button className="remove-button" onClick={() => removeItemFromCart(index)}>
                      Sterge
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="total-section">Total: {total} RON</div>

            <div className="table-number-section">
              <label className="table-label">Numar masa:</label>
              <input
                type="text"
                className="table-input"
                placeholder="ex: 4"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>

            <div className="submit-section">
              <button className="submit-button" onClick={submitOrder}>
                Plaseaza comanda
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
