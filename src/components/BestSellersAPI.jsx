import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, API_URL } from '../config/api';

const BestSellersAPI = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/best-sellers`);
      // Backend returns { products: [...] }
      const productsArray = response.data.products || [];
      setProducts(productsArray); // Use all best sellers returned
      setLoading(false);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      setError('Nuk mund të ngarkohen produktet më të shitura');
      setLoading(false);
    }
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
            src={`${API_BASE_URL}${product.images[0]}`}
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

        {/* Rating - placeholder for now */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  i < 4 // Default rating of 4 stars
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-600">
            4.0 (0)
          </span>
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
          Shto në Shportë
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Po ngarkohen produktet...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produktet" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Më të Shitura
            </h2>
            <p className="text-lg text-gray-600">
              Produktet më të popullarizuara të zgjedhura nga klientët tanë
            </p>
          </div>
          <Link
            to="/kategoria/me-te-shitura"
            className="hidden md:inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-300"
          >
            Shiko të Gjitha
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/kategoria/me-te-shitura"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-300"
          >
            Shiko të Gjitha
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellersAPI;
