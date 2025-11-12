import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Filter, PackageOpen } from 'lucide-react';
import axios from 'axios';
import { API_URL, API_BASE_URL } from '../config/api';
import { formatPrice } from '../utils/currency';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';

const AllProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and pagination
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('search') || '');
  const currentPage = parseInt(searchParams.get('page')) || 1;
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch categories and brands
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get(`${API_URL}/products/categories/list`),
          axios.get(`${API_URL}/products/brands`)
        ]);
        
        setCategories(categoriesRes.data.categories || []);
        setBrands(brandsRes.data || []);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFilters();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 24
        };
        
        if (selectedCategory) params.category = selectedCategory;
        if (selectedBrand) params.brand = selectedBrand;
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        
        const response = await axios.get(`${API_URL}/products`, { params });
        
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
    };

    fetchProducts();
  }, [currentPage, selectedCategory, selectedBrand, debouncedSearchTerm]);

  const handleFilterChange = (filterType, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    
    // Reset to page 1 when filters change
    newParams.delete('page');
    
    setSearchParams(newParams);
    
    // Update local state
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'brand':
        setSelectedBrand(value);
        break;
      case 'search':
        setSearchTerm(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchParams({});
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchTerm('');
    setSortBy('name');
  };

  const handleAddToCart = async (product) => {
    try {
      const result = await addToCart(product.id, 1);
      if (result.success) {
        toast.success(`${product.name} u shtua në shportë!`);
      } else {
        toast.error(result.error || 'Gabim në shtimin në shportë');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gabim në shtimin në shportë');
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
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

  const ProductCard = ({ product }) => (
    <Link to={`/produkti/${product.id}`} className="block h-full">
      <div className="product-card bg-white rounded-xl shadow-lg overflow-hidden group max-w-sm mx-auto w-full h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
        <div className="h-[450px] flex flex-col">
          
          {/* Product Image */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden h-56">
            {product.images && product.images.length > 0 ? (
              <img
                src={`${API_BASE_URL}${product.images[0]}`}
                alt={product.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
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

          {/* Product Info */}
          <div className="p-4 flex flex-col flex-grow">
            {/* Brand Badge */}
            <div className="mb-3">
              <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                {product.brand}
              </span>
            </div>

            {/* Product Name */}
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight text-base group-hover:text-primary-600 transition-colors duration-200">
              {product.name}
            </h3>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
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
              <span className="text-sm text-gray-600 font-medium">4.0</span>
              <span className="text-xs text-gray-500">(24 vlerësime)</span>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto">
              {/* Price */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                disabled={!product.in_stock}
                className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  product.in_stock
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-lg transform hover:scale-105'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{product.in_stock ? 'Shto në Shportë' : 'Pa Stok'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const PaginationComponent = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-12 mb-8">
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Po ngarkohen produktet...</p>
        </div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            Të Gjitha Produktet
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Të Gjitha Produktet</h1>
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
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kërkoni
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Emri i produktit..."
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Të gjitha kategorite</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brandi
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Të gjithë brandat</option>
              {brands.map((brand) => (
                <option key={brand.brand} value={brand.brand}>
                  {brand.brand} ({brand.product_count})
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rendit sipas
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="name">Emri A-Z</option>
              <option value="price-low">Çmimi: Më i ulët</option>
              <option value="price-high">Çmimi: Më i lartë</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedCategory || selectedBrand || searchTerm) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Pastro të gjitha filtrat
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <PaginationComponent />
        </>
      ) : (
        <div className="text-center py-16">
          <div className="flex justify-center text-gray-400 mb-4">
            <PackageOpen className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nuk ka produkte me këto filtra
          </h3>
          <p className="text-gray-600">
            Provo të ndryshosh filtrat ose kthehu në faqen kryesore
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 mr-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Pastro Filtrat
          </button>
          <Link
            to="/"
            className="mt-4 inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            Kthehu në Kryesore
          </Link>
        </div>
      )}
    </div>
  );
};

export default AllProductsPage;