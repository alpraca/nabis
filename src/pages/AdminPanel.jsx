import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Edit, Trash2, Save, X, Upload, Image, Eye, Package, Users, 
  ShoppingCart, TrendingUp, LogOut, User as UserIcon, Search,
  Clock, Truck, Check
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/currency'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [bannerText, setBannerText] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    verifiedOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  })

  const { user, logout, api } = useAuth()
  const navigate = useNavigate()

  // Load data on component mount
  useEffect(() => {
    loadProducts()
    loadBannerText()
    loadStats()
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - these functions are stable

  // Load functions
  const loadProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data.products)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadBannerText = async () => {
    try {
      const response = await api.get('/settings/banner/text')
      setBannerText(response.data.bannerText)
    } catch (error) {
      console.error('Error loading banner:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await api.get('/orders/admin/stats')
      console.log('Stats response:', response.data)
      setStats(response.data.stats || {
        totalProducts: 0,
        totalOrders: 0,
        verifiedOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        totalRevenue: 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      // Set default stats on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        verifiedOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        totalRevenue: 0
      })
    }
  }

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/admin/all?limit=all')
      console.log('Orders response:', response.data)
      
      // Handle different response formats
      let allOrders = []
      if (response.data && Array.isArray(response.data)) {
        allOrders = response.data
      } else if (response.data && response.data.orders && Array.isArray(response.data.orders)) {
        allOrders = response.data.orders
      }
      
      // Show ALL orders, not just verified ones, sorted by order number (newest first)
      const sortedOrders = allOrders.filter ? allOrders
        .sort((a, b) => b.order_number.localeCompare(a.order_number)) : []
      
      setOrders(sortedOrders)
      setFilteredOrders(sortedOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
      setFilteredOrders([])
    }
  }

  // Search and filter orders
  useEffect(() => {
    let filtered = orders

    // Apply search filter
    if (orderSearch) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.user_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (order.email && order.email.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (order.user_email && order.user_email.toLowerCase().includes(orderSearch.toLowerCase()))
      )
    }

    // Apply status filter
    if (orderFilter !== 'all') {
      if (orderFilter === 'pending' || orderFilter === 'verified') {
        // Filter by verification_status for pending/verified
        filtered = filtered.filter(order => order.verification_status === orderFilter)
      } else {
        // Filter by regular status for other options
        filtered = filtered.filter(order => order.status === orderFilter)
      }
    }

    setFilteredOrders(filtered)
  }, [orders, orderSearch, orderFilter])

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus })
      await loadOrders() // Reload orders
      await loadStats() // Reload stats
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Gabim në përditësimin e statusit të porosisë')
    }
  }

  // Delete order
  const deleteOrder = async (orderId, orderNumber) => {
    if (window.confirm(`Jeni i sigurt që doni të fshini porosinë ${orderNumber}?`)) {
      try {
        await api.delete(`/orders/admin/${orderId}`)
        await loadOrders() // Reload orders
        await loadStats() // Reload stats
      } catch (error) {
        console.error('Error deleting order:', error)
        alert('Gabim në fshirjen e porosisë')
      }
    }
  }

  // Get status display
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { color: 'text-yellow-600 bg-yellow-100', icon: Clock, label: 'Në pritje' },
      processing: { color: 'text-blue-600 bg-blue-100', icon: Package, label: 'Duke u përpunuar' },
      shipped: { color: 'text-purple-600 bg-purple-100', icon: Truck, label: 'Dërguar' },
      delivered: { color: 'text-green-600 bg-green-100', icon: Check, label: 'Dorëzuar' },
      cancelled: { color: 'text-red-600 bg-red-100', icon: X, label: 'Anulluar' }
    }
    return statusMap[status] || statusMap.pending
  }

  const handleLogout = () => {
    if (confirm('A jeni të sigurt që doni të dilni?')) {
      logout()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-600">
                Nabis <span className="text-primary-800">Farmaci</span>
              </h1>
              <span className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 bg-red-100 text-red-800 text-xs sm:text-sm font-medium rounded-full">
                Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center text-gray-700">
                <UserIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 sm:h-5 w-4 sm:w-5 mr-1" />
                <span className="text-xs sm:text-sm">Dil</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex flex-wrap gap-2 sm:gap-4">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'orders', name: 'Porosite', icon: ShoppingCart },
              { id: 'products', name: 'Produktet', icon: Package },
              { id: 'banner', name: 'Banner', icon: Edit }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.substring(0, 4)}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Produktet</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Porosite e Verifikuara</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.verifiedOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Përdoruesit</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Të ardhurat</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Të gjitha Porosite</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Gjithsej: {filteredOrders.length} / {orders.length} porosi
                </span>
                <button
                  onClick={loadOrders}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Rifresko</span>
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kërko porosi
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Kërko sipas numrit, emrit ose email-it..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtro sipas statusit
                  </label>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="all">Të gjitha</option>
                    <option value="pending">Në pritje (pa u verifikuar)</option>
                    <option value="verified">E verifikuar</option>
                    <option value="processing">Duke u përpunuar</option>
                    <option value="shipped">Dërguar</option>
                    <option value="delivered">Dorëzuar</option>
                    <option value="cancelled">Anulluar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nr. Porosie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Klienti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Totali
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produktet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statusi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Veprime
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          {orderSearch || orderFilter !== 'all' 
                            ? 'Nuk u gjetën porosi me këto kritere' 
                            : 'Nuk ka porosi të verifikuara akoma'
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order, index) => {
                        const statusDisplay = getStatusDisplay(order.status)
                        const StatusIcon = statusDisplay.icon
                        
                        return (
                          <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">#{order.order_number}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.user_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{order.email || order.user_email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatPrice(order.total_amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{order.item_count} produkt(e)</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(order.created_at).toLocaleDateString('sq-AL')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleTimeString('sq-AL')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${statusDisplay.color} cursor-pointer`}
                                >
                                  <option value="pending">Në pritje</option>
                                  <option value="processing">Duke u përpunuar</option>
                                  <option value="shipped">Dërguar</option>
                                  <option value="delivered">Dorëzuar</option>
                                  <option value="cancelled">Anulluar</option>
                                </select>
                                <StatusIcon className="h-4 w-4" />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    const message = `Detajet e porosisë ${order.order_number}:\n\nKlienti: ${order.user_name}\nEmail: ${order.email || order.user_email}\nTotali: ${formatPrice(order.total_amount)}\nProduktet: ${order.item_count}\nAdresa: ${order.shipping_address}, ${order.shipping_city}\nTelefoni: ${order.phone}\nShënime: ${order.notes || 'Asnjë'}\nData: ${new Date(order.created_at).toLocaleString('sq-AL')}`
                                    alert(message)
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Shiko detajet"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteOrder(order.id, order.order_number)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Fshi porosinë"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredOrders.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {orderSearch || orderFilter !== 'all' 
                      ? 'Nuk u gjetën porosi me këto kritere' 
                      : 'Nuk ka porosi të verifikuara akoma'
                    }
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const statusDisplay = getStatusDisplay(order.status)
                      const StatusIcon = statusDisplay.icon
                      
                      return (
                        <div key={order.id} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">#{order.order_number}</div>
                              <div className="text-sm text-gray-600">{order.user_name}</div>
                              <div className="text-xs text-gray-500">{order.email || order.user_email}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">{formatPrice(order.total_amount)}</div>
                              <div className="text-xs text-gray-500">{order.item_count} produkt(e)</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('sq-AL')}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${statusDisplay.color} cursor-pointer`}
                              >
                                <option value="pending">Në pritje</option>
                                <option value="processing">Duke u përpunuar</option>
                                <option value="shipped">Dërguar</option>
                                <option value="delivered">Dorëzuar</option>
                                <option value="cancelled">Anulluar</option>
                              </select>
                              <StatusIcon className="h-4 w-4" />
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              onClick={() => {
                                const message = `Detajet e porosisë ${order.order_number}:\n\nKlienti: ${order.user_name}\nEmail: ${order.email || order.user_email}\nTotali: ${formatPrice(order.total_amount)}\nProduktet: ${order.item_count}\nAdresa: ${order.shipping_address}, ${order.shipping_city}\nTelefoni: ${order.phone}\nShënime: ${order.notes || 'Asnjë'}\nData: ${new Date(order.created_at).toLocaleString('sq-AL')}`
                                alert(message)
                              }}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded"
                              title="Shiko detajet"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id, order.order_number)}
                              className="text-red-600 hover:text-red-900 p-2 rounded"
                              title="Fshi porosinë"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Menaxhimi i Produkteve</h2>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Shto Produkt</span>
              </button>
            </div>

            {/* Add/Edit Product Form */}
            {(isAddingProduct || editingProduct) && (
              <ProductForm
                product={editingProduct}
                onSave={async (productData) => {
                  try {
                    if (editingProduct) {
                      await api.put(`/products/${editingProduct.id}`, productData)
                    } else {
                      await api.post('/products', productData)
                    }
                    await loadProducts()
                    await loadStats()
                    setIsAddingProduct(false)
                    setEditingProduct(null)
                  } catch (error) {
                    console.error('Error saving product:', error)
                    console.error('Error response:', error.response?.data)
                    alert(`Gabim në ruajtjen e produktit: ${error.response?.data?.error || error.message}`)
                  }
                }}
                onCancel={() => {
                  setIsAddingProduct(false)
                  setEditingProduct(null)
                }}
              />
            )}

            {/* Products List */}
            {!isAddingProduct && !editingProduct && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produkti
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Çmimi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stoku
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statusi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Veprime
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            Nuk ka produkte akoma
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    className="h-10 w-10 rounded object-cover mr-4"
                                    src={product.images[0].startsWith('http') 
                                      ? product.images[0] 
                                      : `http://localhost:3001${product.images[0]}`
                                    }
                                    alt={product.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center mr-4">
                                    <Image className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.brand}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                              {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.original_price)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                {product.is_new && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    I ri
                                  </span>
                                )}
                                {product.on_sale && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    Ofertë
                                  </span>
                                )}
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.in_stock 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.in_stock ? 'Në stok' : 'Jashtë stokut'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Edito produktin"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Jeni i sigurt që doni të fshini produktin "${product.name}"?`)) {
                                      try {
                                        await api.delete(`/products/${product.id}`)
                                        await loadProducts()
                                        await loadStats()
                                      } catch (error) {
                                        console.error('Error deleting product:', error)
                                        alert('Gabim në fshirjen e produktit')
                                      }
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Fshi produktin"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  {products.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      Nuk ka produkte akoma
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <div key={product.id} className="p-4 space-y-3">
                          <div className="flex space-x-3">
                            {product.images && product.images.length > 0 ? (
                              <img
                                className="h-12 w-12 rounded object-cover flex-shrink-0"
                                src={product.images[0].startsWith('http') 
                                  ? product.images[0] 
                                  : `http://localhost:3001${product.images[0]}`
                                }
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <Image className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.brand}</div>
                              <div className="text-xs text-gray-600">{product.category}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</div>
                              {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatPrice(product.original_price)}
                                </div>
                              )}
                              <div className="text-xs text-gray-600">Stoku: {product.stock_quantity}</div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {product.is_new && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  I ri
                                </span>
                              )}
                              {product.on_sale && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  Ofertë
                                </span>
                              )}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.in_stock 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {product.in_stock ? 'Në stok' : 'Jashtë stokut'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded"
                              title="Edito produktin"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Jeni i sigurt që doni të fshini produktin "${product.name}"?`)) {
                                  try {
                                    await api.delete(`/products/${product.id}`)
                                    await loadProducts()
                                    await loadStats()
                                  } catch (error) {
                                    console.error('Error deleting product:', error)
                                    alert('Gabim në fshirjen e produktit')
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-900 p-2 rounded"
                              title="Fshi produktin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Banner Tab */}
        {activeTab === 'banner' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Banner Admin</h2>
            
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teksti i Banner-it (shfaqet në krye të faqes)
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="Shkruani tekstin e banner-it këtu..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                  <button
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await api.post('/settings/banner/text', { bannerText })
                        alert('Banner-i u përditësua me sukses!')
                      } catch (error) {
                        console.error('Error updating banner:', error)
                        alert('Gabim në përditësimin e banner-it')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="w-full sm:w-auto bg-primary-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Duke ruajtur...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Ruaj</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {bannerText && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Parashikimi:</h3>
                  <div className="bg-primary-600 text-white p-3 rounded-md text-center text-sm">
                    {bannerText}
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Udhëzime:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Banner-i shfaqet në krye të të gjitha faqeve</li>
                  <li>• Mund të përdorni për reklamat e përkohshme</li>
                  <li>• Lëreni bosh për ta fshehur banner-in</li>
                  <li>• Ndryshimet aplikohen menjëherë në faqe</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Product Form Component
const ProductForm = ({ product, onSave, onCancel }) => {
  const { api } = useAuth() // Add this to access the api instance
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    category: product?.category || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    description: product?.description || '',
    stock_quantity: product?.stock_quantity || '',
    is_new: product?.is_new || false,
    on_sale: product?.on_sale || false,
    in_stock: product?.in_stock !== false
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingImages] = useState(product?.images || [])
  const [imageUrls, setImageUrls] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Brand autocomplete states
  const [brandSuggestions, setBrandSuggestions] = useState([])
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false)
  const [allBrands, setAllBrands] = useState([])

  // Load brands when component mounts
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await api.get('/products/brands')
        setAllBrands(response.data || [])
      } catch (error) {
        console.error('Error loading brands:', error)
      }
    }
    loadBrands()
  }, [api])

  // Filter brand suggestions based on input
  const handleBrandChange = (value) => {
    setFormData(prev => ({ ...prev, brand: value }))
    
    if (value.length > 0) {
      const filtered = allBrands.filter(brand => 
        brand.brand && brand.brand.toLowerCase().includes(value.toLowerCase())
      )
      setBrandSuggestions(filtered)
      setShowBrandSuggestions(filtered.length > 0)
    } else {
      setShowBrandSuggestions(false)
    }
  }

  // Select brand from suggestions
  const selectBrand = (brandName) => {
    setFormData(prev => ({ ...prev, brand: brandName }))
    setShowBrandSuggestions(false)
  }

  const categories = [
    { value: 'dermokozmetike/fytyre', label: 'Dermokozmetikë - Fytyre' },
    { value: 'dermokozmetike/floket', label: 'Dermokozmetikë - Flokët' },
    { value: 'dermokozmetike/trupi', label: 'Dermokozmetikë - Trupi' },
    { value: 'dermokozmetike/spf', label: 'Dermokozmetikë - SPF' },
    { value: 'dermokozmetike/tanning', label: 'Dermokozmetikë - Tanning' },
    { value: 'dermokozmetike/makeup', label: 'Dermokozmetikë - Makeup' },
    { value: 'higjena/depilim-intime', label: 'Higjena - Depilim dhe Intime' },
    { value: 'higjena/goja', label: 'Higjena - Goja' },
    { value: 'higjena/kembet', label: 'Higjena - Këmbët' },
    { value: 'higjena/trupi', label: 'Higjena - Trupi' },
    { value: 'farmaci/otc', label: 'Farmaci - OTC (pa recetë)' },
    { value: 'farmaci/seksuale', label: 'Farmaci - Mirëqenia seksuale' },
    { value: 'farmaci/aparat', label: 'Farmaci - Aparat mjekësore' },
    { value: 'farmaci/first-aid', label: 'Farmaci - First aid' },
    { value: 'farmaci/ortopedike', label: 'Farmaci - Ortopedike' },
    { value: 'mama-beba/nena/shtatzani', label: 'Mama dhe Bebat - Shtatzëni' },
    { value: 'mama-beba/nena/ushqyerje', label: 'Mama dhe Bebat - Ushqyerje me gji' },
    { value: 'mama-beba/bebi/pelena', label: 'Mama dhe Bebat - Pelena' },
    { value: 'mama-beba/bebi/higjena', label: 'Mama dhe Bebat - Higjena bebi' },
    { value: 'mama-beba/bebi/spf', label: 'Mama dhe Bebat - SPF bebi' },
    { value: 'mama-beba/bebi/suplemente', label: 'Mama dhe Bebat - Suplemente bebi' },
    { value: 'mama-beba/aksesor', label: 'Mama dhe Bebat - Aksesorë' },
    { value: 'mama-beba/planifikim', label: 'Mama dhe Bebat - Planifikim familjar' },
    { value: 'produkte-shtese/sete', label: 'Produkte Shtesë - Sete' },
    { value: 'produkte-shtese/vajra', label: 'Produkte Shtesë - Vajra esencial' },
    { value: 'suplemente', label: 'Suplemente' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      const requiredFields = ['name', 'brand', 'category', 'description', 'price']
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '')
      
      if (missingFields.length > 0) {
        alert(`Fushat e mëposhtme janë të detyrueshme: ${missingFields.join(', ')}`)
        setIsSubmitting(false)
        return
      }

      const submitData = new FormData()
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key])
      })

      // Add image files
      selectedFiles.forEach(file => {
        submitData.append('images', file)
      })

      // TODO: Add image URL handling later
      /*
      // Add image URLs if provided
      if (imageUrls.trim()) {
        const urls = imageUrls.split(',').map(url => url.trim()).filter(url => url)
        urls.forEach(url => {
          submitData.append('imageUrls', url)
        })
      }
      */

      await onSave(submitData)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Gabim në ruajtjen e produktit')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {product ? 'Edito Produktin' : 'Shto Produkt të Ri'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emri i Produktit *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marka
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              onFocus={() => {
                if (formData.brand.length > 0) {
                  const filtered = allBrands.filter(brand => 
                    brand.brand.toLowerCase().includes(formData.brand.toLowerCase())
                  )
                  setBrandSuggestions(filtered)
                  setShowBrandSuggestions(filtered.length > 0)
                }
              }}
              onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="Shkruani markën e produktit"
            />
            
            {/* Brand suggestions dropdown */}
            {showBrandSuggestions && brandSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {brandSuggestions.map((brand, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectBrand(brand.brand)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{brand.brand}</div>
                    <div className="text-xs text-gray-500">Produktet: {brand.product_count || 0}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategoria *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="">Zgjidhni kategorinë</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Çmimi (€) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Çmimi Origjinal (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sasia në Stok
            </label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Përshkrimi
          </label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        {/* Images Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotot e Produktit
          </label>
          
          {/* File Upload */}
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Ose zgjidhni foto nga kompjuteri</p>
          </div>

          {/* URL Input */}
          <div>
            <input
              type="text"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder="Ose vendosni URL të fotove (ndarë me presje)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Shembull: https://example.com/foto1.jpg, https://example.com/foto2.jpg</p>
          </div>

          {/* Existing Images Preview */}
          {existingImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Fotot ekzistuese:</p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img, index) => (
                  <img
                    key={index}
                    src={img.startsWith('http') ? img : `http://localhost:3001${img}`}
                    alt={`Product ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_new"
              checked={formData.is_new}
              onChange={(e) => setFormData(prev => ({ ...prev, is_new: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_new" className="ml-2 block text-sm text-gray-900">
              Produkt i ri
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="on_sale"
              checked={formData.on_sale}
              onChange={(e) => setFormData(prev => ({ ...prev, on_sale: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="on_sale" className="ml-2 block text-sm text-gray-900">
              Në ofertë
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="in_stock"
              checked={formData.in_stock}
              onChange={(e) => setFormData(prev => ({ ...prev, in_stock: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-900">
              Në stok
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
          >
            Anulo
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Duke ruajtur...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{product ? 'Përditëso' : 'Ruaj'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminPanel
