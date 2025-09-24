import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, API_URL } from '../config/api';
import { formatPrice } from '../utils/currency';
import { useCart } from '../hooks/useCart';

const BestSellersAPI = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/best-sellers`);
      
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      setError('Nuk mund të ngarkohen produktet më të shitura');
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const result = await addToCart(product.id, 1);
      if (result.success) {
        alert(`${product.name} u shtua në shportë!`);
      } else {
        alert(result.error || 'Gabim në shtimin në shportë');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gabim në shtimin në shportë');
    }
  };

  const ProductCard = ({ product }) => (
    <Link to={`/produkti/${product.id}`} className="block">
      <div className="product-card bg-white rounded-lg shadow-md overflow-hidden group max-w-sm mx-auto w-full h-full hover:shadow-lg transition-shadow duration-300 relative">
        
        {/* Product Image */}
        <div className="relative bg-gray-50 h-48 sm:h-64 flex items-center justify-center overflow-hidden">
          {/* Wishlist Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add to wishlist logic here
              alert(`Shtove ${product.name} tek të preferuarat!`);
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          >
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
          </button>

          {/* Product Image */}
          {product.images && product.images.length > 0 ? (
            <img
              src={`${API_BASE_URL}${product.images[0]}`}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="16">📦 Nuk ka foto</text></svg>';
              }}
            />
          ) : (
            <div className="text-6xl text-gray-400 flex items-center justify-center h-full">📦</div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          {/* Brand */}
          <p className="text-xs sm:text-sm text-gray-500 mb-1">{product.brand}</p>

          {/* Product Name */}
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 leading-tight flex-grow">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
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
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Add to Cart Button */}
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
            <span>{product.in_stock ? 'Shto në Shportë' : 'Pa stok'}</span>
          </button>
        </div>
      </div>
    </Link>
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
            to="/kategori/me-te-shitura"
            className="hidden md:inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-300"
          >
            Shiko të Gjitha
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.length > 0 ? (
            products.slice(0, 8).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Nuk ka produkte të disponueshme</p>
            </div>
          )}
        </div>

        {/* View All Button - Mobile */}
        <div className="mt-12 text-center md:hidden">
          <Link
            to="/kategori/me-te-shitura"
            className="inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-300"
          >
            Shiko të Gjitha
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellersAPI;
