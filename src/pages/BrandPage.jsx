import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Package, TrendingUp } from 'lucide-react'
import axios from 'axios'
import { formatPrice } from '../utils/currency'
import { API_URL } from '../config/api'

const BrandPage = () => {
  const [brands, setBrands] = useState([])
  const [filteredBrands, setFilteredBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Sort alfabetikisht A-Z
      const sorted = [...brands].sort((a, b) => 
        a.brand.localeCompare(b.brand, 'sq-AL')
      )
      setFilteredBrands(sorted)
    } else {
      const filtered = brands.filter(brand =>
        brand.brand.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort((a, b) => 
        a.brand.localeCompare(b.brand, 'sq-AL')
      )
      setFilteredBrands(filtered)
    }
  }, [searchTerm, brands])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      // Try the new brands endpoint first, fallback to products/brands
      try {
        const response = await axios.get(`${API_URL}/brands`)
        setBrands(response.data.brands || [])
        setFilteredBrands(response.data.brands || [])
      } catch {
        // Fallback to old endpoint
        const response = await axios.get(`${API_URL}/products/brands`)
        setBrands(response.data || [])
        setFilteredBrands(response.data || [])
      }
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
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
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Provo sërish
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Brandet</h1>
          <p className="text-gray-600 mb-6">
            Zbuloni të gjitha markat e disponueshme në Nabis Farmaci
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Kërkoni një markë..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-teal-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Gjithsej Marka</p>
                <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Produktet Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {brands.reduce((acc, brand) => acc + (brand.product_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Search className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Rezultatet</p>
                <p className="text-2xl font-bold text-gray-900">{filteredBrands.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBrands.map((brand, index) => (
              <div
                key={index}
                onClick={() => handleBrandClick(brand.brand)}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:border-teal-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {brand.brand.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors duration-300 mb-2">
                  {brand.brand}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {brand.product_count || 0} {(brand.product_count || 0) === 1 ? 'produkt' : 'produkte'}
                </p>
                {brand.min_price && brand.max_price && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Çmimet nga</p>
                    <p className="text-sm font-medium text-teal-600">
                      {formatPrice(brand.min_price)} - {formatPrice(brand.max_price)}
                    </p>
                  </div>
                )}
                <div className="w-full h-px bg-gray-200 group-hover:bg-teal-300 transition-colors duration-300 mt-3"></div>
                <p className="text-xs text-gray-400 mt-3 group-hover:text-teal-500 transition-colors duration-300">
                  Kliko për të parë produktet
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka brandë të disponueshme</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Provoni një term tjetër kërkimi.' : 'Brandët do të shfaqen kur të shtohen produkte.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrandPage
