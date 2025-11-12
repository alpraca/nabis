import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Shield, Truck, RefreshCw, PackageOpen } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { API_URL, API_BASE_URL } from '../config/api';
import { formatPrice } from '../utils/currency';

const ProductPageAPI = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart: addProductToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      // Handle both direct product and object responses
      const productData = response.data.product || response.data;
      setProduct(productData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Produkti nuk u gjet');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    // Check if product is in stock
    if (!product.in_stock || product.stock_quantity <= 0) {
      toast.error('Ky produkt nuk është në stok momentalisht.');
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn()) {
      const shouldLogin = window.confirm(
        'Ju duhet të jeni të kyçur për të shtuar produktet në shportë.\n\nDëshironi të kyçeni tani?'
      );
      if (shouldLogin) {
        navigate('/hyrje', { state: { from: `/produkti/${id}` } });
      }
      return;
    }

    setAddingToCart(true);
    const result = await addProductToCart(product.id, quantity);
    
    if (result.success) {
      toast.success(`✅ U shtua në shportë: ${product.name} (${quantity} copë)`);
    } else {
      toast.error(`❌ ${result.error}`);
    }
    
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Po ngarkohet produkti...</p>
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
            <li>
              <Link to={`/kategoria/${product.category}`} className="text-gray-500 hover:text-gray-700">
                {product.category}
              </Link>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li className="text-gray-900 font-medium">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col-reverse">
            {/* Image selector - Mobile scrollable */}
            {product.images && product.images.length > 1 && (
              <div className="mt-6 w-full">
                {/* Mobile horizontal scroll */}
                <div className="sm:hidden">
                  <div className="flex space-x-3 overflow-x-auto pb-3">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        className={`flex-shrink-0 w-20 h-20 bg-white rounded-md overflow-hidden border-2 ${
                          index === selectedImageIndex ? 'border-primary-500' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={`${API_BASE_URL}${image}`}
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop grid */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-4 gap-4 max-w-lg">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        className={`relative h-24 bg-white rounded-md overflow-hidden border-2 transition-all duration-200 ${
                          index === selectedImageIndex 
                            ? 'border-primary-500 ring-2 ring-primary-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={`${API_BASE_URL}${image}`}
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main image with navigation */}
            <div className="w-full aspect-square relative group">
              <div className="h-full w-full bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={`${API_BASE_URL}${product.images[selectedImageIndex]}`}
                      alt={product.name}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M20.91 8.84 8.56 21.19a2 2 0 0 1-2.83 0l-5.46-5.46a2 2 0 0 1 0-2.83L12.6 .57a2 2 0 0 1 2.83 0l5.46 5.46a2 2 0 0 1 0 2.83Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>';
                      }}
                    />
                    
                    {/* Navigation arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex(selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(selectedImageIndex === product.images.length - 1 ? 0 : selectedImageIndex + 1)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* Image counter */}
                    {product.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImageIndex + 1} / {product.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PackageOpen className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>
            
            <div className="mt-3">
              <h2 className="text-lg text-gray-500">{product.brand}</h2>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Vlerësimi</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="sr-only">5 out of 5 stars</p>
                <p className="ml-3 text-sm text-gray-500">
                  5.0 (0 vlerësime)
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-3xl tracking-tight text-gray-900">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Përshkrimi</h3>
              <div className="mt-4 space-y-6">
                <p className="text-gray-700">
                  {product.description || 'Nuk ka përshkrim të disponueshëm.'}
                </p>
              </div>
            </div>

            <form className="mt-10">
              <div className="mt-10 flex">
                <div className="flex items-center space-x-3 mr-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Sasia
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="max-w-full rounded-md border border-gray-300 py-1.5 px-3 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart || !product.in_stock || product.stock_quantity <= 0}
                  className={`flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full disabled:opacity-50 disabled:cursor-not-allowed ${
                    !product.in_stock || product.stock_quantity <= 0
                      ? 'bg-gray-400 text-gray-200'
                      : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {!product.in_stock || product.stock_quantity <= 0 
                    ? 'Pa stok' 
                    : addingToCart 
                      ? 'Duke shtuar...' 
                      : 'Shto në shportë'
                  }
                </button>
              </div>
            </form>

            {/* Product features */}
            <section className="mt-12">
              <h3 className="text-lg font-medium text-gray-900">Informacione të tjera</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Produkt origjinal</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-sm text-gray-700">Transport falas për porosi mbi 30€</span>
                </div>
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-orange-500 mr-3" />
                  <span className="text-sm text-gray-700">Kthim i lehtë brenda 14 ditëve</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPageAPI;
