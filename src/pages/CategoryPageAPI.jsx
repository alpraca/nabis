import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, Star, Heart } from 'lucide-react';
import axios from 'axios';

const CategoryPageAPI = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/products');
      // Backend returns { products: [...] }
      const productsArray = response.data.products || [];
      
      // Filter by category if category parameter exists
      let filteredProducts = productsArray;
      if (category && category !== 'te-gjitha') {
        const categoryParam = decodeURIComponent(category).toLowerCase();
        
        filteredProducts = productsArray.filter(product => {
          const productCategory = product.category?.toLowerCase() || '';
          
          // Check different matching patterns:
          // 1. Exact match (e.g., "suplemente")
          // 2. End with category (e.g., "dermokozmetike/fytyre" matches "fytyre")
          // 3. Contains category as part (e.g., "dermokozmetike" matches "dermokozmetike/fytyre")
          return productCategory === categoryParam || 
                 productCategory.endsWith(`/${categoryParam}`) ||
                 productCategory.startsWith(`${categoryParam}/`) ||
                 productCategory.split('/').includes(categoryParam);
        });
      }
      
      setProducts(filteredProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Nuk mund të ngarkohen produktet');
      setLoading(false);
    }
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

  const getCategoryTitle = () => {
    if (!category || category === 'te-gjitha') return 'Të Gjitha Produktet';
    return decodeURIComponent(category).split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const ProductCard = ({ product }) => (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden group max-w-sm mx-auto w-full">
      {/* Product Image */}
      <div className="relative bg-gray-50 h-48 sm:h-64 flex items-center justify-center">
        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>

        {/* Product Image */}
        {product.images && product.images.length > 0 ? (
          <img
            src={`http://localhost:3001${product.images[0]}`}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="16">📦 Nuk ka foto</text></svg>';
            }}
          />
        ) : (
          <div className="text-6xl text-gray-400">📦</div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Brand */}
        <p className="text-xs sm:text-sm text-gray-500 mb-1">{product.brand}</p>

        {/* Product Name */}
        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating - placeholder */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  i < 4 // Default 4 stars
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-600">4.0 (0)</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            {product.price}€
          </span>
        </div>

        {/* Add to Cart Button */}
        <Link
          to={`/produkti/${product.id}`}
          className="w-full bg-primary-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-primary-700 transition-colors duration-300 text-center block text-sm sm:text-base"
        >
          Shiko Detajet
        </Link>
      </div>
    </div>
  );

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
              {products.length} produkte të gjetura
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
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

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl text-gray-400 mb-4">📦</div>
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
