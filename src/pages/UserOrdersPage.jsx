import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/currency';

const UserOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Gabim në marrjen e porosive tuaja');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Duhet të jeni i kyçur për të parë porosite tuaja');
      setLoading(false);
      return;
    }

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: 'bg-yellow-100', textColor: 'text-yellow-800', icon: Clock, label: 'Në pritje' },
      'shipped': { color: 'bg-blue-100', textColor: 'text-blue-800', icon: Truck, label: 'E dërguar' },
      'delivered': { color: 'bg-green-100', textColor: 'text-green-800', icon: CheckCircle, label: 'E dorëzuar' },
      'cancelled': { color: 'bg-red-100', textColor: 'text-red-800', icon: AlertCircle, label: 'E anuluar' }
    };

    const info = statusMap[status] || statusMap['pending'];
    const Icon = info.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${info.color} ${info.textColor} text-sm font-medium`}>
        <Icon className="h-4 w-4" />
        {info.label}
      </div>
    );
  };

  const getVerificationStatus = (status) => {
    if (status === 'verified') {
      return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Verifikuar</span>;
    } else if (status === 'pending') {
      return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⏳ Në pritje verifikimi</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Duke ngarkuar porosite tuaja...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/produktet" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kthehu në produktet
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Porosite Tuaja</h1>
          <p className="text-gray-600">Këtu mund të shihni statusin e të gjitha porosive tuaja</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">Nuk keni porosi ende</h2>
            <p className="text-gray-600 mb-4">Filloni të blini dhe të gjitha porosite do të shfaqen këtu</p>
            <Link to="/produktet" className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
              Shikoni produktet
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Numri i Porosisë</p>
                      <p className="text-lg font-bold text-gray-900">#{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Data</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(order.created_at).toLocaleDateString('sq-AL')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Shuma</p>
                      <p className="text-lg font-bold text-green-600">{formatPrice(order.total_amount)}</p>
                    </div>
                    <div className="flex justify-end items-end">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Adresa e Dërgesës</h3>
                      <p className="text-sm text-gray-700 mb-1"><strong>Emri:</strong> {order.name}</p>
                      <p className="text-sm text-gray-700 mb-1"><strong>Adresa:</strong> {order.shipping_address}</p>
                      <p className="text-sm text-gray-700 mb-1"><strong>Qyteti:</strong> {order.shipping_city}</p>
                      <p className="text-sm text-gray-700"><strong>Telefon:</strong> {order.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Informacioni i Dërgesës</h3>
                      <p className="text-sm text-gray-700 mb-2"><strong>Email:</strong> {order.email}</p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Metoda e pagesës:</strong> {order.payment_method === 'cash_on_delivery' ? 'Pagesa me dorë' : order.payment_method}
                      </p>
                      {order.verification_status && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 mb-2"><strong>Verifikimi:</strong></p>
                          {getVerificationStatus(order.verification_status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                {order.items && order.items.length > 0 && (
                  <div className="p-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Produktet në Porosi</h3>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-600">Sasia: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formatPrice(item.total)}</p>
                            <p className="text-xs text-gray-600">{formatPrice(item.price)} / copë</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;
