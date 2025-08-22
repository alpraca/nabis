import React from 'react'
import { Link } from 'react-router-dom'

const ShopByBrand = () => {
  const brands = [
    {
      id: 1,
      name: 'Roche',
      logo: '🏥',
      description: 'Produkte farmaceutike të certifikuara',
      productCount: 45
    },
    {
      id: 2,
      name: 'La Roche-Posay',
      logo: '💎',
      description: 'Dermokozmetikë për lëkurë të ndjeshme',
      productCount: 67
    },
    {
      id: 3,
      name: 'Vichy',
      logo: '🌊',
      description: 'Kujdes i përditshëm për lëkurën',
      productCount: 52
    },
    {
      id: 4,
      name: 'Avène',
      logo: '🌸',
      description: 'Produkte të buta për lëkurë të irrituar',
      productCount: 38
    },
    {
      id: 5,
      name: 'Eucerin',
      logo: '🧴',
      description: 'Shkencë për lëkurën tuaj',
      productCount: 41
    },
    {
      id: 6,
      name: 'Bioderma',
      logo: '💧',
      description: 'Biologji në shërbim të dermatologjisë',
      productCount: 29
    },
    {
      id: 7,
      name: 'Nuxe',
      logo: '🌿',
      description: 'Bukuria natyrore franceze',
      productCount: 33
    },
    {
      id: 8,
      name: 'Ducray',
      logo: '🌱',
      description: 'Specialistë për flokët dhe lëkurën',
      productCount: 22
    },
    {
      id: 9,
      name: 'Uriage',
      logo: '💙',
      description: 'Uji termal për shëndetin e lëkurës',
      productCount: 35
    },
    {
      id: 10,
      name: 'Mustela',
      logo: '👶',
      description: 'Kujdes i specializuar për bebat',
      productCount: 28
    }
  ]

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

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/marka/${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:border-primary-300">
                {/* Brand Logo */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {brand.logo}
                </div>

                {/* Brand Name */}
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                  {brand.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {brand.description}
                </p>

                {/* Product Count */}
                <p className="text-xs text-gray-500">
                  {brand.productCount} produkte
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Brands Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Markat e Zgjedhura
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Brand 1 */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6">
              <div className="text-center">
                <div className="text-5xl mb-4">🏥</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Roche</h4>
                <p className="text-gray-600 mb-4">
                  Lider botëror në inovacionin farmaceutik me mbi 125 vjet përvojë
                </p>
                <Link
                  to="/marka/roche"
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-300"
                >
                  Eksploro Produktet
                </Link>
              </div>
            </div>

            {/* Featured Brand 2 */}
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-6">
              <div className="text-center">
                <div className="text-5xl mb-4">💎</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">La Roche-Posay</h4>
                <p className="text-gray-600 mb-4">
                  Dermokozmetikë e rekomanduar nga dermatologët për lëkurë të ndjeshme
                </p>
                <Link
                  to="/marka/la-roche-posay"
                  className="inline-flex items-center justify-center px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors duration-300"
                >
                  Eksploro Produktet
                </Link>
              </div>
            </div>

            {/* Featured Brand 3 */}
            <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-6">
              <div className="text-center">
                <div className="text-5xl mb-4">👶</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Mustela</h4>
                <p className="text-gray-600 mb-4">
                  Kujdes i specializuar dhe i sigurt për lëkurën delikate të bebit
                </p>
                <Link
                  to="/marka/mustela"
                  className="inline-flex items-center justify-center px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors duration-300"
                >
                  Eksploro Produktet
                </Link>
              </div>
            </div>
          </div>
        </div>

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
