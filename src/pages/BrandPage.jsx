import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const BrandPage = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3001/api/products/brands')
      setBrands(response.data)
    } catch (error) {
      console.error('Error fetching brands:', error)
      setError('Ndodhi një gabim gjatë ngarkimit të brandeve')
    } finally {
      setLoading(false)
    }
  }

  const handleBrandClick = (brand) => {
    navigate(`/brand/${encodeURIComponent(brand)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Duke ngarkuar brandët...</p>
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
              onClick={fetchBrands}
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
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Brandët</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Zbuloni produktet tona nga brandët më të njohura në botën e farmacisë dhe kozmetikës
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
                <span className="text-sm font-medium text-gray-500">Brandët</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Brands Grid */}
        {brands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {brands.map((brand, index) => (
              <div
                key={index}
                onClick={() => handleBrandClick(brand.brand)}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:border-primary-300 group"
              >
                <div className="flex items-center justify-center h-24 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                    {brand.brand}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {brand.product_count} {brand.product_count === 1 ? 'produkt' : 'produkte'}
                </p>
                <div className="w-full h-px bg-gray-200 group-hover:bg-primary-300 transition-colors duration-300"></div>
                <p className="text-xs text-gray-400 mt-3 group-hover:text-primary-500 transition-colors duration-300">
                  Kliko për të parë produktet
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka brandë të disponueshme</h3>
            <p className="text-gray-500">Brandët do të shfaqen kur të shtohen produkte.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrandPage
