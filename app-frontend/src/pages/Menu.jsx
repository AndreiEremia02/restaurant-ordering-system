import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../assets/components/CartContext';
import rawMenuData from '../assets/data/menuData';
import '../assets/styles/Menu.css';

function Menu() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();
  const location = useLocation();

  const menuData = rawMenuData.map(category => ({
    ...category,
    products: category.products.map((product, index) => ({
      ...product,
      id: `${category.category}-${index}`
    }))
  }));

  const handleQtyChange = (id, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    for (let i = 0; i < qty; i++) {
      addToCart({
        nume: product.name,
        pret: product.price,
        imagine: product.image
      });
    }
    setPopupMessage(`"${product.name}" a fost adaugat in cart!`);
    setTimeout(() => setPopupMessage(''), 2000);
  };

  const openPopup = (product) => setSelectedProduct(product);
  const closePopup = () => setSelectedProduct(null);

  const handleAddFromPopup = () => {
    if (selectedProduct) {
      handleAddToCart(selectedProduct);
      closePopup();
    }
  };

  const clientType = location.pathname.includes("online-customer");

  return (
    <div className="menu-container">
      <h2 className="menu-title">MENIU</h2>

      {menuData.map((cat, index) => (
        <div key={index} className="menu-section mb-4">
          <h3 className="category-title">{cat.category}</h3>
          <div className="menu-carousel">
            {cat.products.map((product) => (
              <div key={product.id} className="menu-card" onClick={() => openPopup(product)}>
                <img src={product.image} alt={product.name} className="menu-img" />
                <div className="menu-info" onClick={(e) => e.stopPropagation()}>
                  <h5 className="menu-name">{product.name.toUpperCase()}</h5>
                  <p className="menu-price">{product.price} RON</p>
                  {!clientType && (
                    <div className="menu-actions">
                      <input
                        type="number"
                        min="1"
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQtyChange(product.id, e.target.value)}
                        className="menu-qty"
                      />
                      <button className="menu-btn" onClick={() => handleAddToCart(product)}>
                        ADAUGA IN COS
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedProduct && (
        <div className="product-popup" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}>×</button>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="popup-img" />
            <h3>{selectedProduct.name}</h3>
            <p>{selectedProduct.description}</p>
            <p className="popup-price">{selectedProduct.price} RON</p>
            {!clientType && (
              <div className="popup-actions">
                <input
                  type="number"
                  min="1"
                  value={quantities[selectedProduct.id] || 1}
                  onChange={(e) => handleQtyChange(selectedProduct.id, e.target.value)}
                  className="menu-qty"
                />
                <button className="menu-btn" onClick={handleAddFromPopup}>
                  ADAUGA IN COS
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {popupMessage && <div className="quick-popup">{popupMessage}</div>}

      {!clientType && (
        <Link
          to={
            sessionStorage.getItem("masaCurenta")
              ? `/cart?tableNumber=${sessionStorage.getItem("masaCurenta")}`
              : "/cart?client=online-customer"
          }
          className="floating-cart-button"
        >
          <i className="bi bi-cart-fill"></i>
        </Link>
      )}
    </div>
  );
}

export default Menu;
