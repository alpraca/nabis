import React from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

const BestSellers = () => {
  // Sample products - in a real app, this would come from an API
  const products = [
    {
      id: 1,
      name: 'Vitaminë C Serum Premium',
      brand: 'Nabis Care',
      price: '2,500',
      originalPrice: '3,000',
      image: '💊',
      rating: 4.8,
      reviews: 124,
      isNew: false,
      isSale: true
    },
    {
      id: 2,
      name: 'Krem Antiplakëse Natë',
      brand: 'Derma Plus',
      price: '3,200',
      originalPrice: null,
      image: '🧴',
      rating: 4.9,
      reviews: 89,
      isNew: true,
      isSale: false
    },
    {
      id: 3,
      name: 'Suplemente Imuniteti',
      brand: 'Health Pro',
      price: '1,800',
      originalPrice: '2,200',
      image: '💊',
      rating: 4.7,
      reviews: 256,
      isNew: false,
      isSale: true
    },
    {
      id: 4,
      name: 'Shampon Kundër Rënies',
      brand: 'Hair Care',
      price: '2,100',
      originalPrice: null,
      image: '🧴',
      rating: 4.6,
      reviews: 178,
      isNew: false,
      isSale: false
    },
    {
      id: 5,
      name: 'Krem Mbrojtës SPF 50',
      brand: 'Sun Guard',
      price: '2,800',
      originalPrice: null,
      image: '☀️',
      rating: 4.8,
      reviews: 203,
      isNew: true,
      isSale: false
    },
    {
      id: 6,
      name: 'Probiotikë të Fortë',
      brand: 'Bio Health',
      price: '3,500',
      originalPrice: '4,000',
      image: '💊',
      rating: 4.9,
      reviews: 145,
      isNew: false,
      isSale: true
    },
    {
      id: 7,
      name: 'Serum për Syrin',
      brand: 'Eye Care Pro',
      price: '2,900',
      originalPrice: null,
      image: '👁️',
      rating: 4.7,
      reviews: 92,
      isNew: false,
      isSale: false
    },
    {
      id: 8,
      name: 'Krem Hidratues për Trupin',
      brand: 'Body Essentials',
      price: '1,600',
      originalPrice: '1,900',
      image: '🧴',
      rating: 4.5,
      reviews: 167,
      isNew: false,
      isSale: true
    }
  ]

  const ProductCard = ({ product }) => (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden group">
      {/* Product Image */}
      <div className="relative bg-gray-50 h-64 flex items-center justify-center">
        {/* Badge */}
        {(product.isNew || product.isSale) && (
          <div className="absolute top-3 left-3 z-10">
            {product.isNew && (
              <span className="bg-secondary-600 text-white px-2 py-1 text-xs font-semibold rounded-md mr-2">
                E RE
              </span>
            )}
            {product.isSale && (
              <span className="bg-red-600 text-white px-2 py-1 text-xs font-semibold rounded-md">
                ZBRITJE
              </span>
            )}
          </div>
        )}

        {/* Product Image Placeholder */}
        <div className="text-6xl">{product.image}</div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-lg font-bold text-gray-900">
            {product.price} L
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {product.originalPrice} L
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Link
          to={`/produkt/${product.id}`}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors duration-300 text-center block"
        >
          Shto në Shportë
        </Link>
      </div>
    </div>
  )

  return (
    <section className="py-16 bg-gray-50">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/kategori/me-te-shitura"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-300"
          >
            Shiko të Gjitha
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BestSellers
