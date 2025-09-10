import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CartContext } from './CartContextDefinition';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, api } = useAuth();

  const loadCart = useCallback(async () => {
    // Only load cart if user is authenticated
    if (!user) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/cart');
      const cartItemsFromAPI = response.data.cartItems || [];
      
      // For each cart item, fetch product details
      const cartItemsWithProducts = await Promise.all(
        cartItemsFromAPI.map(async (item) => {
          try {
            const productResponse = await api.get(`/products/${item.product_id}`);
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
  }, [user, api]);

  // Load cart when component mounts or user changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (productId, quantity = 1) => {
    // Check if user is authenticated before making the request
    if (!user) {
      return { success: false, error: 'Ju duhet të jeni të kyçur për të shtuar produktet në shportë' };
    }

    try {
      // Add to backend cart (requires authentication)
      await api.post('/cart/add', 
        { product_id: productId, quantity }
      );
      
      // Reload cart to get updated data
      await loadCart();
      
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        return { success: false, error: 'Ju duhet të jeni të kyçur për të shtuar produktet në shportë' };
      }
      
      return { success: false, error: error.response?.data?.error || 'Gabim në shtimin në shportë' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        await api.delete(`/cart/${itemId}`);
      } else {
        await api.put(`/cart/${itemId}`, { quantity });
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
      await api.delete(`/cart/${itemId}`);
      await loadCart();
      
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: 'Gabim në heqjen nga shporta' };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
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
