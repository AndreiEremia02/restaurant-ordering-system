import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('cart');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      } catch (e) {
        console.error('Eroare la parsarea cosului:', e);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    if (product?.id && typeof product.price === 'number') {
      setCartItems((prevItems) => [...prevItems, product]);
    } else {
      console.warn('Produsul adaugat nu are id sau pret valid:', product);
    }
  };

  const removeFromCart = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <CartContext.Provider
      value={{
        cart: cartItems,
        addToCart,
        removeFromCart,
        setCart: setCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => useContext(CartContext);
export { useCart };
