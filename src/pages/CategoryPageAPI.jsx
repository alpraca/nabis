import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Star, ShoppingCart, ChevronLeft, ChevronRight, Grid, List, PackageOpen } from 'lucide-react';
import axios from 'axios';
import { API_URL, API_BASE_URL } from '../config/api';
import { formatPrice } from '../utils/currency';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { SkeletonProductCard, SkeletonProductListItem } from '../components/SkeletonLoaders';

const CategoryPageAPI = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const currentPage = parseInt(searchParams.get('page')) || 1;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const endpoint = category === 'me-te-shitura' 
        ? `${API_URL}/products/best-sellers`
        : `${API_URL}/products`;

      const params = {
        page: currentPage,
        limit: 24
      };
      
      // Add category filter if not "all products" or "best-sellers"
      if (category && category !== 'te-gjitha' && category !== 'me-te-shitura') {
        params.category = category;
      }
      
      const response = await axios.get(endpoint, { params });
      
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || {
        page: currentPage,
        limit: 24,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Nuk mund të ngarkohen produktet');
      setLoading(false);
    }
  }, [category, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [category, currentPage, fetchProducts]);

  const handleAddToCart = async (product) => {
    // Check if user is logged in first
    if (!isLoggedIn()) {
      const shouldLogin = window.confirm(
        'Ju duhet të jeni të kyçur për të shtuar produktet në shportë.\n\nDëshironi të kyçeni tani?'
      );
      if (shouldLogin) {
        navigate('/hyrje', { state: { from: window.location.pathname } });
      }
      return;
    }

    try {
      const result = await addToCart(product.id, 1);
      if (result.success) {
        toast.success(`${product.name} u shtua në shportë!`);
      } else {
        toast.error(result.error || 'Gabim në shtimin në shportë');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Gabim në shtimin në shportë');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      const start = Math.max(1, currentPage - 2);
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

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const PaginationComponent = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-12 mb-8">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            pagination.hasPrev
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Mëparshme
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
              disabled={page === '...'}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                page === pagination.page
                  ? 'bg-primary-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNext}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            pagination.hasNext
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Tjetra
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    );
  };

  const getCategoryTitle = () => {
    if (!category || category === 'te-gjitha') return 'Të Gjitha Produktet';
    if (category === 'me-te-shitura') return 'Më të Shitura';
    return decodeURIComponent(category).split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const ProductCard = ({ product }) => {
    return (
    <Link to={`/produkti/${product.id}`} className="block">
      <div className="product-card bg-white rounded-lg shadow-md overflow-hidden group max-w-sm mx-auto w-full h-full hover:shadow-lg transition-shadow duration-300 relative">
        
        {/* Fixed Grid Layout for Uniform Heights */}
        <div className="h-[420px] grid grid-rows-[200px_1fr_auto_auto_auto] gap-2">
          
          {/* Product Image - Fixed Height */}
          <div className="relative bg-gray-50 flex items-center justify-center overflow-hidden">
            {/* Product Image */}
            {product.images && product.images.length > 0 ? (
              <img
                src={`${API_BASE_URL}${product.images[0]}`}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.error(`❌ Image failed to load: ${product.images[0]}`);
                  console.error('Full image URL:', e.target.src);
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.91 8.84 8.56 21.19a2 2 0 0 1-2.83 0l-5.46-5.46a2 2 0 0 1 0-2.83L12.6 .57a2 2 0 0 1 2.83 0l5.46 5.46a2 2 0 0 1 0 2.83Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <PackageOpen className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Product Info, Rating, and Price Container */}
          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            {/* Brand & Name */}
            <div className="flex-grow">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full mb-2">
                {product.brand}
              </span>
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 h-12 sm:h-14 overflow-hidden">
                {product.name}
              </h3>
            </div>

            {/* Rating & Price */}
            <div className="mt-auto pt-2">
              <div className="flex items-center justify-between">
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">4.0 (0)</span>
                </div>
                {/* Price */}
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button - Always at Bottom */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(product);
              }}
              disabled={!product.in_stock}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base font-medium transition-colors duration-200 ${
                product.in_stock
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{product.in_stock ? 'Shto në shportë' : 'Pa stok'}</span>
            </button>
          </div>

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
            {/* Product Image */}
            <div className="relative w-48 h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={`${API_BASE_URL}${product.images[0]}`}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.91 8.84 8.56 21.19a2 2 0 0 1-2.83 0l-5.46-5.46a2 2 0 0 1 0-2.83L12.6 .57a2 2 0 0 1 2.83 0l5.46 5.46a2 2 0 0 1 0 2.83Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center text-gray-400">
                  <PackageOpen className="w-9 h-9" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 p-6">
              <div className="flex justify-between h-full">
                <div className="flex-1">
                  {/* Brand */}
                  <p className="text-sm text-gray-500 mb-2">{product.brand}</p>

                  {/* Product Name */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">4.0 (0)</span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!product.in_stock}
                      className={`flex items-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                        product.in_stock
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
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
    const skeletonCount = pagination.limit || 12;
    return (
      <div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-9 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
              <div className="h-10 bg-gray-200 rounded-md w-48"></div>
            </div>
          </div>

          {/* Products Skeleton */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0 items-stretch">
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <SkeletonProductCard key={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <SkeletonProductListItem key={index} />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Link to="/" className="mt-4 inline-block text-primary-600 hover:underline">
            Kthehu në faqen kryesore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              Kryesore
            </Link>
          </li>
          <li>
            <span className="text-gray-500">/</span>
          </li>
          <li className="text-gray-900 font-medium">
            {getCategoryTitle()}
          </li>
        </ol>
      </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{getCategoryTitle()}</h1>
            <p className="mt-2 text-gray-600">
              {pagination.total > 0 ? (
                <>
                  {pagination.total} produkte të gjetura
                  {pagination.totalPages > 1 && (
                    <span className="ml-2 text-sm">
                      (Faqja {pagination.page} nga {pagination.totalPages})
                    </span>
                  )}
                </>
              ) : (
                'Nuk ka produkte'
              )}
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Rendit sipas:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="name">Emri A-Z</option>
              <option value="price-low">Çmimi: Më i ulët</option>
              <option value="price-high">Çmimi: Më i lartë</option>
            </select>
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0 items-stretch">
                {sortedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <ProductListItem 
                    key={product.id} 
                    product={product} 
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            <PaginationComponent />
          </>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center text-gray-400 mb-4">
              <PackageOpen className="w-16 h-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nuk ka produkte në këtë kategori
            </h3>
            <p className="text-gray-600">
              Provo të kërkosh në kategori të tjera ose kthehu në faqen kryesore
            </p>
            <Link
              to="/"
              className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
            >
              Kthehu në Kryesore
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPageAPI;
