import { createContext, useState, useContext, useEffect } from 'react';
import { TEXTS } from '../data/texts';

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
        console.error(TEXTS.CART_CONTEXT.PARSE_ERROR, e);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    if (product?.id && typeof product.price === 'number') {
      const productToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      };
      setCartItems((prevItems) => [...prevItems, productToAdd]);
    } else {
      console.warn(TEXTS.CART_CONTEXT.ADD_WARNING, product);
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
