import React, { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Grid, List, Filter, SortAsc, Package, ArrowLeft, ShoppingCart, Heart, Star } from 'lucide-react'
import axios from 'axios'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/currency'

const BrandProductsPage = () => {
  const { brand } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [filterCategory, setFilterCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [brandStats, setBrandStats] = useState(null)
  
  const { addToCart } = useCart()

  const decodedBrand = decodeURIComponent(brand)
  const productsPerPage = 20

  const handlePageChange = (newPage) => {
    const totalPages = pagination.totalPages || 1;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const currentPageNum = pagination.page || 1;
    const totalPages = pagination.totalPages || 1;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPageNum - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const fetchBrandProducts = useCallback(async () => {
    try {
      setLoading(true)
      // Try new brands API first, fallback to old endpoint
      try {
        const response = await axios.get(`http://localhost:3001/api/brands/${encodeURIComponent(decodedBrand)}`, {
          params: {
            page: currentPage,
            limit: productsPerPage,
            sort: sortBy,
            category: filterCategory || undefined
          }
        })
        setProducts(response.data.products || [])
        // Transform pagination data to match expected format
        const paginationData = response.data.pagination || {}
        setPagination({
          ...paginationData,
          totalPages: paginationData.pages || 1,
          hasPrev: paginationData.page > 1,
          hasNext: paginationData.page < (paginationData.pages || 1)
        })
      } catch {
        // Fallback to old endpoint
        const response = await axios.get(`http://localhost:3001/api/products/brand/${encodeURIComponent(decodedBrand)}`)
        setProducts(response.data.products || [])
      }
    } catch (error) {
      console.error('Error fetching brand products:', error)
      setError('Ndodhi një gabim gjatë ngarkimit të produkteve')
    } finally {
      setLoading(false)
    }
  }, [decodedBrand, currentPage, sortBy, filterCategory])

  const fetchBrandStats = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/brands/${encodeURIComponent(decodedBrand)}/stats`)
      setBrandStats(response.data.stats || null)
    } catch {
      // Silently fail - stats are optional
      console.log('Brand stats not available')
    }
  }, [decodedBrand])

  useEffect(() => {
    fetchBrandProducts()
    fetchBrandStats()
  }, [fetchBrandProducts, fetchBrandStats])

  // Get unique categories from current products as fallback
  const availableCategories = brandStats?.categories || [...new Set(products.map(p => p.category).filter(Boolean))]

  const handleAddToCart = async (product) => {
    try {
      const result = await addToCart(product.id, 1);
      if (result.success) {
        alert('Produkti u shtua në shportë me sukses!');
      } else {
        alert('Gabim në shtimin e produktit në shportë');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gabim në shtimin e produktit në shportë');
    }
  }

  const PaginationComponent = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    return (
      <div className="flex flex-col items-center mt-12 mb-8 space-y-4">
        {/* Page Info */}
        <div className="text-sm text-gray-600">
          Faqja <span className="font-medium text-gray-900">{pagination.page || 1}</span> nga{' '}
          <span className="font-medium text-gray-900">{pagination.totalPages || 1}</span>
          {pagination.total && (
            <span> • {pagination.total} produkte gjithsej</span>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              pagination.hasPrev
                ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-600 hover:shadow-md'
                : 'bg-gray-50 border-2 border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mëparshme
          </button>

          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                disabled={page === '...'}
                className={`min-w-[40px] h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 ${
                  page === (pagination.page || 1)
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-105 border-2 border-teal-500'
                    : page === '...'
                    ? 'text-gray-400 cursor-default bg-transparent'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-600 hover:shadow-md hover:scale-105'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              pagination.hasNext
                ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-600 hover:shadow-md'
                : 'bg-gray-50 border-2 border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Tjetra
            <ArrowLeft className="h-4 w-4 ml-2 transform rotate-180" />
          </button>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    return (
      <Link to={`/produkti/${product.id}`} className="block h-full">
        <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
          <div className="relative">
            <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
              <img
                src={product.images && product.images.length > 0 ? `http://localhost:3001${product.images[0]}` : '/api/placeholder/300/300'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full mb-2">
                {product.brand}
              </span>
              <h3 className="font-semibold text-gray-900 mb-2 h-12 overflow-hidden">
                {product.name}
              </h3>
            </div>
            <div className="mt-auto pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">4.0 (0)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
              disabled={!product.in_stock}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded text-sm font-medium transition-colors duration-200 ${product.in_stock ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{product.in_stock ? 'Shto në shportë' : 'Pa stok'}</span>
            </button>
          </div>
        </div>
      </Link>
    );
  };

  const ProductListItem = ({ product }) => {
    return (
      <Link to={`/produkti/${product.id}`} className="block">
        <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300">
          <div className="flex">
            <div className="relative w-48 h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
              <img
                src={product.images && product.images.length > 0 ? `http://localhost:3001${product.images[0]}` : '/api/placeholder/300/300'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 p-6">
              <div className="flex justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">4.0 (0)</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
                      disabled={!product.in_stock}
                      className={`flex items-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${product.in_stock ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{product.in_stock ? 'Shto në shportë' : 'Pa stok'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Duke ngarkuar produktet...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchBrandProducts}
              className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Provo sërish
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Produktet nga <span className="text-primary-600">{decodedBrand}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Zbuloni të gjitha produktet e disponueshme nga brandi {decodedBrand}
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-teal-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kreu
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link 
                  to="/brande" 
                  className="text-sm font-medium text-gray-700 hover:text-teal-600"
                >
                  Brandët
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">{decodedBrand}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Brand Stats */}
        {brandStats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Package className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{brandStats.total_products}</p>
                <p className="text-sm text-gray-600">Produkte</p>
              </div>
              <div className="text-center">
                <Filter className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{brandStats.categories_count}</p>
                <p className="text-sm text-gray-600">Kategori</p>
              </div>
              <div className="text-center">
                <SortAsc className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{formatPrice(brandStats.min_price)}</p>
                <p className="text-sm text-gray-600">Çmimi më i ulët</p>
              </div>
              <div className="text-center">
                <SortAsc className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{formatPrice(brandStats.max_price)}</p>
                <p className="text-sm text-gray-600">Çmimi më i lartë</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and View Options */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Category Filter */}
              {availableCategories.length > 0 && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Të gjitha kategoritë</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="name">Renditu sipas emrit</option>
                <option value="price_asc">Çmimi: i ulët në të lartë</option>
                <option value="price_desc">Çmimi: i lartë në të ulët</option>
                <option value="newest">Më të rejat</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {pagination.total || products.length} {pagination.total === 1 ? 'produkt' : 'produkte'} të disponueshme
              </p>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductListItem 
                    key={product.id} 
                    product={product} 
                  />
                ))}
              </div>
            )}
            
            <PaginationComponent />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nuk ka produkte të disponueshme
            </h3>
            <p className="text-gray-500 mb-4">
              Aktualisht nuk ka produkte nga brandi {decodedBrand}.
            </p>
            <Link
              to="/brande"
              className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded hover:bg-primary-50"
            >
              Shiko brandë të tjera
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrandProductsPage
