import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, PackageOpen, Truck } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/currency';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(item.id);
    } else {
      await updateQuantity(item.id, newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Po ngarkohet shporta...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shporta Juaj</h1>
            <p className="mt-2 text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'produkt' : 'produkte'} në shportë
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center text-primary-600 hover:text-primary-700 self-start sm:self-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Vazhdo blerjen</span>
            <span className="sm:hidden">Kthehu</span>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-4">
              Shporta është e zbrazët
            </h3>
            <p className="text-gray-600 mb-8">
              Duket se nuk keni shtuar asnjë produkt në shportën tuaj ende.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Filloni blerjen
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Produktet në shportë</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={`http://localhost:3001${item.images[0]}`}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-100 rounded-md flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M20.91 8.84 8.56 21.19a2 2 0 0 1-2.83 0l-5.46-5.46a2 2 0 0 1 0-2.83L12.6 .57a2 2 0 0 1 2.83 0l5.46 5.46a2 2 0 0 1 0 2.83Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                              <PackageOpen className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="ml-6 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                <Link 
                                  to={`/produkti/${item.product_id}`}
                                  className="hover:text-primary-600"
                                >
                                  {item.name}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.brand}
                              </p>
                              <p className="text-lg font-medium text-gray-900 mt-2">
                                {formatPrice(item.price)}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                  className="p-2 hover:bg-gray-50 rounded-l-md"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-2 text-center min-w-[3rem]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                  className="p-2 hover:bg-gray-50 rounded-r-md"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 p-2"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Përmbledhja e porosisë
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nëntotali</span>
                    <span className="font-medium">{formatPrice(getCartTotal())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transporti</span>
                    <span className="font-medium">
                      {getCartTotal() >= 30 ? 'Falas' : formatPrice(3)}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-medium">
                      <span>Totali</span>
                      <span>
                        {formatPrice(getCartTotal() + (getCartTotal() >= 30 ? 0 : 3))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {user ? (
                    <Link
                      to="/check-out"
                      className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors text-center block"
                    >
                      Vazhdo me pagesa
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/hyrje"
                        state={{ from: { pathname: '/shporta' } }}
                        className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors text-center block"
                      >
                        Hyni për të vazhduar
                      </Link>
                      <p className="text-sm text-gray-600 text-center">
                        ose{' '}
                        <Link to="/regjistrohu" className="text-primary-600 hover:underline">
                          regjistrohuni
                        </Link>
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                    <Truck className="w-4 h-4" />
                    Transport falas për porosi mbi {formatPrice(30)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
