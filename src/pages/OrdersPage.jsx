import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import { formatPrice } from '../utils/currency'
import { API_BASE_URL } from '../config/api'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Ju lutemi logohuni për të parë porositë tuaja')
        setLoading(false)
        return
      }

      const response = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      } else {
        setError(data.message || 'Gabim në marrjen e porosive')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Gabim në komunikimin me serverin')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Në pritje',
      'confirmed': 'E konfirmuar', 
      'processing': 'Në përgatitje',
      'shipped': 'E dërguar',
      'delivered': 'E dorëzuar',
      'cancelled': 'E anulluar'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800', 
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getVerificationStatusText = (status) => {
    const statusMap = {
      'pending': 'Në pritje për verifikim',
      'verified': 'E verifikuar',
      'cancelled': 'E anulluar'
    }
    return statusMap[status] || status
  }

  const getVerificationStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-orange-100 text-orange-800',
      'verified': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Porositë e Mia</h1>
            <p className="text-gray-600">Shikoni historinë e porosive tuaja dhe statusin e tyre</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="text-red-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk keni bërë asnjë porosi</h3>
              <p className="text-gray-500 mb-6">Filloni të blini nga zgjedhja jonë e gjerë e produkteve farmaceutike</p>
              <Link 
                to="/products" 
                className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
              >
                Shikoni Produktet
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Porosia #{order.order_number}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(order.verification_status)}`}>
                            {getVerificationStatusText(order.verification_status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          E bërë më {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="mt-4 lg:mt-0 lg:text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(order.total_amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.item_count} artikuj
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Artikujt e porosisë:</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {item.image_url ? (
                              <img 
                                src={`${API_BASE_URL}${item.image_url}`} 
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M20.91 8.84 8.56 21.19a2 2 0 0 1-2.83 0l-5.46-5.46a2 2 0 0 1 0-2.83L12.6 .57a2 2 0 0 1 2.83 0l5.46 5.46a2 2 0 0 1 0 2.83Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-500">{item.product_brand}</p>
                            <p className="text-sm text-gray-500">Sasi: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatPrice(item.total)}</p>
                            <p className="text-sm text-gray-500">{formatPrice(item.price)} / copë</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Adresa e Dërgesës</h5>
                        <p className="text-sm text-gray-600">
                          {order.shipping_address}<br />
                          {order.shipping_city}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Kontakti</h5>
                        <p className="text-sm text-gray-600">
                          Tel: {order.phone}<br />
                          Email: {order.email}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Mënyra e Pagesës</h5>
                        <p className="text-sm text-gray-600">
                          {order.payment_method === 'cash_on_delivery' ? 'Pagesë në dorëzim' : order.payment_method}
                        </p>
                      </div>
                    </div>
                    {order.notes && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Shënime</h5>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrdersPage