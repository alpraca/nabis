import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const ShopByBrand = () => {
  const [brandsData, setBrandsData] = useState([])
  const [loading, setLoading] = useState(true)

  // Static brand info with logos and descriptions
  const staticBrandInfo = {
    'Roche': {
      logo: '🏥',
      description: 'Produkte farmaceutike të certifikuara'
    },
    'La Roche-Posay': {
      logo: '💎',
      description: 'Dermokozmetikë për lëkurë të ndjeshme'
    },
    'Vichy': {
      logo: '🌊',
      description: 'Kujdes i përditshëm për lëkurën'
    },
    'Avène': {
      logo: '🌸',
      description: 'Produkte të buta për lëkurë të irrituar'
    },
    'Eucerin': {
      logo: '🧴',
      description: 'Shkencë për lëkurën tuaj'
    },
    'Bioderma': {
      logo: '💧',
      description: 'Biologji në shërbim të dermatologjisë'
    },
    'Nuxe': {
      logo: '🌿',
      description: 'Bukuria natyrore franceze'
    },
    'Ducray': {
      logo: '🌱',
      description: 'Specialistë për flokët dhe lëkurën'
    },
    'Uriage': {
      logo: '💙',
      description: 'Uji termal për shëndetin e lëkurës'
    },
    'Mustela': {
      logo: '�',
      description: 'Kujdes i specializuar për bebat'
    }
  }

  useEffect(() => {
    fetchBrandsData()
  }, [])

  const fetchBrandsData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3001/api/products/brands')
      
      // Use all brands from API, just limit to first 6 for landing page
      const combinedData = response.data
        .map((brand, index) => ({
          id: index + 1,
          name: brand.brand,
          productCount: brand.product_count,
          logo: staticBrandInfo[brand.brand]?.logo || '🏢',
          description: staticBrandInfo[brand.brand]?.description || 'Produkte të cilësisë së lartë'
        }))
        .slice(0, 6) // Show only first 6 brands on landing page

      setBrandsData(combinedData)
    } catch (error) {
      console.error('Error fetching brands data:', error)
      // Fallback to static data if API fails
      setBrandsData([])
    } finally {
      setLoading(false)
    }
  }

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brandsData.map((brand) => (
              <Link
                key={brand.id}
                to={`/brand/${encodeURIComponent(brand.name)}`}
                className="group h-full"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:border-primary-300 h-full flex flex-col justify-between min-h-[200px]">
                  {/* Brand Logo */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {brand.logo}
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
