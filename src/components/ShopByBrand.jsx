import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Sparkles, Droplets, Flower2, Droplet, Leaf, Sprout, Waves, Baby, Building2 } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '../config/api'

// Icon mapping for brands
const brandIcons = {
  'Roche': Heart,
  'La Roche-Posay': Sparkles,
  'Vichy': Waves,
  'Avène': Flower2,
  'Eucerin': Droplet,
  'Bioderma': Droplets,
  'Nuxe': Leaf,
  'Ducray': Sprout,
  'Uriage': Waves,
  'Mustela': Baby
}

// Static brand info with descriptions
const staticBrandInfo = {
  'Roche': {
    description: 'Produkte farmaceutike të certifikuara'
  },
  'La Roche-Posay': {
    description: 'Dermokozmetikë për lëkurë të ndjeshme'
  },
  'Vichy': {
    description: 'Kujdes i përditshëm për lëkurën'
  },
  'Avène': {
    description: 'Produkte të buta për lëkurë të irrituar'
  },
  'Eucerin': {
    description: 'Shkencë për lëkurën tuaj'
  },
  'Bioderma': {
    description: 'Biologji në shërbim të dermatologjisë'
  },
  'Nuxe': {
    description: 'Bukuria natyrore franceze'
  },
  'Ducray': {
    description: 'Specialistë për flokët dhe lëkurën'
  },
  'Uriage': {
    description: 'Uji termal për shëndetin e lëkurës'
  },
  'Mustela': {
    description: 'Kujdes i specializuar për bebat'
  }
}

const ShopByBrand = () => {
  const [brandsData, setBrandsData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBrandsData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/products/brands`)
      
      // Sort alfabetikisht dhe merr 5 të parët
      const combinedData = response.data
        .sort((a, b) => a.brand.localeCompare(b.brand, 'sq-AL'))
        .map((brand, index) => ({
          id: index + 1,
          name: brand.brand,
          productCount: brand.product_count,
          Icon: brandIcons[brand.brand] || Building2,
          description: staticBrandInfo[brand.brand]?.description || 'Produkte të cilësisë së lartë'
        }))
        .slice(0, 5) // Show only first 5 brands on landing page

      setBrandsData(combinedData)
    } catch (error) {
      console.error('Error fetching brands data:', error)
      // Fallback to static data if API fails
      setBrandsData([])
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array is fine since staticBrandInfo is now a constant outside component

  useEffect(() => {
    fetchBrandsData()
  }, [fetchBrandsData])
 
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Blerje sipas Markës
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Zgjidhni nga markat më të besuara të industrisë farmaceutike dhe dermokozmetike
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Duke ngarkuar markat...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {brandsData.map((brand) => (
              <Link
                key={brand.id}
                to={`/brand/${encodeURIComponent(brand.name)}`}
                className="group h-full"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:border-primary-300 h-full flex flex-col justify-between min-h-[200px]">
                  {/* Brand Logo */}
                  <div className="flex justify-center mb-4 text-primary-600 group-hover:scale-110 transition-transform duration-300">
                    <brand.Icon className="w-10 h-10" />
                  </div>

                  {/* Brand Name */}
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300 text-center">
                    {brand.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 flex-1 text-center">
                    {brand.description}
                  </p>

                  {/* Product Count */}
                  <p className="text-xs text-gray-500 mt-auto">
                    {brand.productCount} produkte
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && brandsData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Nuk ka marka të disponueshme aktualisht.</p>
          </div>
        )}

        {/* View All Brands */}
        <div className="text-center mt-12">
          <Link
            to="/brande"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-300"
          >
            Shiko të Gjitha Markat
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ShopByBrand
