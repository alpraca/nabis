import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useCart } from '../hooks/useCart'

const BrandProductsPage = () => {
  const { brand } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()

  const decodedBrand = decodeURIComponent(brand)

  useEffect(() => {
    fetchBrandProducts()
  }, [brand])

  const fetchBrandProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:3001/api/products/brand/${encodeURIComponent(decodedBrand)}`)
      // Backend returns { products: [...], brand }
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching brand products:', error)
      setError('Ndodhi një gabim gjatë ngarkimit të produkteve')
    } finally {
      setLoading(false)
    }
  }

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
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                Kreu
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link 
                  to="/brande" 
                  className="text-sm font-medium text-gray-700 hover:text-primary-600"
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

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {products.length} {products.length === 1 ? 'produkt' : 'produkte'} të disponueshme
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative">
                    <Link to={`/produkti/${product.id}`}>
                      <img
                        src={product.images && product.images.length > 0 
                          ? `http://localhost:3001${product.images[0]}`
                          : '/api/placeholder/300/300'
                        }
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col space-y-1">
                      {product.is_new && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          E re
                        </span>
                      )}
                      {product.on_sale && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Ofertë
                        </span>
                      )}
                    </div>

                    {/* Wishlist button */}
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                      <Link 
                        to={`/brand/${encodeURIComponent(product.brand)}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {product.brand}
                      </Link>
                    </div>
                    
                    <Link to={`/produkti/${product.id}`}>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 hover:text-primary-600 line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Description */}
                    <div className="flex-grow">
                      {product.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-3 min-h-[3rem]">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Rating (placeholder) */}
                    <div className="flex items-center mb-2 mt-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(0)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {product.price}€
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.original_price}€
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.in_stock}
                      className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded text-sm font-medium transition-colors duration-200 mt-auto ${
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
              ))}
            </div>
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
