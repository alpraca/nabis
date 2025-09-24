import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, CreditCard, MapPin, Phone, User, Mail } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/currency';
import axios from 'axios';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal } = useCart();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shippingAddress: '',
    shippingCity: '',
    phone: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shporta');
    }
  }, [cartItems, navigate]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Emri është i nevojshëm';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email-i është i nevojshëm';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email-i nuk është valid';
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Adresa është e nevojshme';
    }

    if (!formData.shippingCity.trim()) {
      newErrors.shippingCity = 'Qyteti është i nevojshëm';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Numri i telefonit është i nevojshëm';
    } else if (!/^[0-9+\-\s()]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Numri i telefonit nuk është valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        shipping_address: formData.shippingAddress.trim(),
        shipping_city: formData.shippingCity.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim()
      };

      const response = await axios.post('http://localhost:3001/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        // Don't clear cart yet - only clear after verification
        // Redirect to verification page with cart items for reference
        navigate('/order-verification', { 
          state: { 
            orderId: response.data.orderId,
            email: formData.email,
            cartItems: cartItems,
            total: finalTotal
          }
        });
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error.response?.data?.error || 'Gabim në krijimin e porosisë';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotal = getCartTotal();
  const shippingCost = cartTotal >= 30 ? 0 : 3;
  const finalTotal = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex items-center mb-6 sm:mb-8">
        <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Përfundo Blerjen</h1>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informacioni i Klientit
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emri *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Emri juaj i plotë"
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email për verifikim *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email-i për verifikim të porosisë"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Adresa e Dërgesës
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresa e plotë *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Rruga, numri i shtëpisë, zona, kodi postar..."
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                        errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.shippingAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingAddress}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qyteti *
                    </label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      placeholder="Tiranë, Durrës, Vlorë..."
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.shippingCity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.shippingCity && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingCity}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefoni *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+355 69 123 4567"
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shënime (opsionale)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Instruksione për dorëzimin, kohe e përshtatshme, etj..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Metoda e Pagesës
              </h2>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">💰</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Pagesa në Dorëzim (Cash on Delivery)
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Do të paguani kur të merrni produktet. Pranojmë para cash dhe kartë.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Duke përpunuar...
                  </div>
                ) : (
                  `Porosit Tani - ${formatPrice(finalTotal)}`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Përmbledhja e Porosisë
            </h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="flex-shrink-0 w-16 h-16">
                    {item.product?.images && item.product.images.length > 0 ? (
                      <img
                        src={`http://localhost:3001${item.product.images[0]}`}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.product?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.product?.brand}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">
                        Sasia: {item.quantity}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(item.product?.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nëntotali</span>
                <span className="font-medium">{formatPrice(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transporti</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'Falas' : `${formatPrice(shippingCost)}`}
                </span>
              </div>
              
              <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-200">
                <span>Totali</span>
                <span className="text-primary-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {cartTotal < 30 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-700 text-sm">
                  💡 Shtoni {formatPrice(30 - cartTotal)} më shumë për transport falas!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
