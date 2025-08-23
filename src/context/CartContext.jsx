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

  // Load cart when component mounts or user changes
  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const headers = user ? { 'user-id': user.id } : {};
      const response = await axios.get('http://localhost:3001/api/cart', { headers });
      const cartItemsFromAPI = response.data.cartItems || [];
      
      // For each cart item, fetch product details
      const cartItemsWithProducts = await Promise.all(
        cartItemsFromAPI.map(async (item) => {
          try {
            const productResponse = await axios.get(`http://localhost:3001/api/products/${item.product_id}`);
            return {
              ...item,
              product: productResponse.data
            };
          } catch (error) {
            console.error(`Error fetching product ${item.product_id}:`, error);
            return {
              ...item,
              product: null
            };
          }
        })
      );
      
      setCartItems(cartItemsWithProducts);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const headers = user ? { 'user-id': user.id } : {};
      
      // Add to backend cart (works for both users and guests)
      await axios.post('http://localhost:3001/api/cart/add', 
        { product_id: productId, quantity },
        { headers }
      );
      
      // Reload cart to get updated data
      await loadCart();
      
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: 'Gabim në shtimin në shportë' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const headers = user ? { 'user-id': user.id } : {};
      
      if (quantity <= 0) {
        await axios.delete(`http://localhost:3001/api/cart/${itemId}`, { headers });
      } else {
        await axios.put(`http://localhost:3001/api/cart/${itemId}`, { quantity }, { headers });
      }
      
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error: 'Gabim në përditësimin e sasisë' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const headers = user ? { 'user-id': user.id } : {};
      
      await axios.delete(`http://localhost:3001/api/cart/${itemId}`, { headers });
      await loadCart();
      
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: 'Gabim në heqjen nga shporta' };
    }
  };

  const clearCart = async () => {
    try {
      const headers = user ? { 'user-id': user.id } : {};
      
      await axios.delete('http://localhost:3001/api/cart', { headers });
      setCartItems([]);
      
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
