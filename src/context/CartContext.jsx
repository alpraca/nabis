import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, api } = useAuth();

  // Load cart when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      // Load from localStorage for guests
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [user]);

  // Save cart to localStorage for guests
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCartItems(response.data.cartItems || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      if (user) {
        // Add to backend cart
        await api.post('/cart/add', { product_id: productId, quantity });
        await loadCart(); // Reload cart
      } else {
        // Add to local cart for guests
        const existingItem = cartItems.find(item => item.product_id === productId);
        
        if (existingItem) {
          setCartItems(cartItems.map(item =>
            item.product_id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ));
        } else {
          // Fetch product details for local cart
          const productResponse = await axios.get(`http://localhost:3001/api/products/${productId}`);
          const product = productResponse.data.product;
          
          setCartItems([...cartItems, {
            id: Date.now(), // temporary ID for guests
            product_id: productId,
            quantity,
            product: product
          }]);
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: 'Gabim në shtimin në shportë' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (user) {
        await api.put(`/cart/${itemId}`, { quantity });
        await loadCart();
      } else {
        if (quantity <= 0) {
          setCartItems(cartItems.filter(item => item.id !== itemId));
        } else {
          setCartItems(cartItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ));
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error: 'Gabim në përditësimin e sasisë' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (user) {
        await api.delete(`/cart/${itemId}`);
        await loadCart();
      } else {
        setCartItems(cartItems.filter(item => item.id !== itemId));
      }
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: 'Gabim në heqjen nga shporta' };
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await api.delete('/cart');
        setCartItems([]);
      } else {
        setCartItems([]);
        localStorage.removeItem('cart');
      }
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: 'Gabim në zbrazjen e shportës' };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle both formats: item.product.price (guest) and item.price (backend)
      const price = item.product?.price || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
