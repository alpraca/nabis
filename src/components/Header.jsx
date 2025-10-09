import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { cartItems } = useCart()
  const { user, logout } = useAuth()
  const userDropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const menuItems = [
    {
      name: 'Dermokozmetikë',
      id: 'dermokozmetike',
      subcategories: [
        { name: 'Fytyre', id: 'fytyre' },
        { name: 'Flokët', id: 'floket' },
        { name: 'Trupi', id: 'trupi' },
        { name: 'SPF', id: 'spf' },
        { name: 'Tanning', id: 'tanning' },
        { name: 'Makeup', id: 'makeup' }
      ]
    },
    {
      name: 'Higjena',
      id: 'higjena',
      subcategories: [
        { name: 'Depilim dhe Intime', id: 'depilim-intime' },
        { name: 'Goja', id: 'goja' },
        { name: 'Këmbët', id: 'kembet' },
        { name: 'Trupi', id: 'trupi-higjena' }
      ]
    },
    {
      name: 'Farmaci',
      id: 'farmaci',
      subcategories: [
        { name: 'OTC (pa recetë)', id: 'otc' },
        { name: 'Mirëqenia seksuale', id: 'mireqenia-seksuale' },
        { name: 'Aparat mjekësore', id: 'aparat-mjeksore' },
        { name: 'First Aid (Ndihmë e Parë)', id: 'first-aid' },
        { name: 'Ortopedike', id: 'ortopedike' }
      ]
    },
    {
      name: 'Mama dhe Bebat',
      id: 'mama-bebat',
      subcategories: [
        { 
          name: 'Kujdesi ndaj Nënës', 
          id: 'kujdesi-nenes',
          subsubcategories: [
            { name: 'Shtatzëni', id: 'shtatzeni' },
            { name: 'Ushqyerje me Gji', id: 'ushqyerje-gji' }
          ]
        },
        { 
          name: 'Kujdesi ndaj Bebit', 
          id: 'kujdesi-bebit',
          subsubcategories: [
            { name: 'Pelena', id: 'pelena' },
            { name: 'Higjena', id: 'higjena-bebe' },
            { name: 'SPF', id: 'spf-bebe' },
            { name: 'Suplementa', id: 'suplementa-bebe' }
          ]
        },
        { name: 'Aksesore për Beba', id: 'aksesor-beba' },
        { name: 'Planifikim Familjar', id: 'planifikim-familjar' }
      ]
    },
    {
      name: 'Produkte Shtesë',
      id: 'produkte-shtese',
      subcategories: [
        { name: 'Sete', id: 'sete' },
        { name: 'Vajra Esencial', id: 'vajra-esencial' }
      ]
    },
    {
      name: 'Suplemente',
      id: 'suplemente',
      subcategories: [
        { name: 'Vitaminat dhe Mineralet', id: 'vitaminat-dhe-mineralet' },
        { name: 'Çajra Mjekësore', id: 'cajra-mjekesore' },
        { name: 'Proteinë dhe Fitness', id: 'proteine-dhe-fitness' },
        { name: 'Suplementet Natyrore', id: 'suplementet-natyrore' }
      ]
    }
  ]

  const otherMenuItems = [
    { name: 'Më të Shitura', id: 'kategori/me-te-shitura' },
    { name: 'Brande', id: 'brande' },
    { name: 'Kontakt', id: 'kontakt', scrollTo: true }
  ]

  const scrollToFooter = () => {
    const footerElement = document.getElementById('kontakt')
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const toggleDropdown = (itemId) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId)
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-primary-600">
              Nabis <span className="text-secondary-600">Farmaci</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 py-2"
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <span>{item.name}</span>
                  {item.subcategories && <ChevronDown className="h-4 w-4" />}
                </button>

                {/* Dropdown Menu */}
                {item.subcategories && activeDropdown === item.id && (
                  <div
                    className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    onMouseEnter={() => setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="py-2">
                      {item.subcategories.map((subcat) => (
                        <div key={subcat.id} className="relative group/sub">
                          <Link
                            to={`/kategori/${subcat.id}`}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 flex items-center justify-between"
                          >
                            <span>{subcat.name}</span>
                            {subcat.subsubcategories && (
                              <ChevronDown className="h-3 w-3 rotate-270" />
                            )}
                          </Link>
                          
                          {/* Sub-subcategories dropdown */}
                          {subcat.subsubcategories && (
                            <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-60 opacity-0 group-hover/sub:opacity-100 pointer-events-none group-hover/sub:pointer-events-auto transition-opacity duration-200">
                              <div className="py-2">
                                {subcat.subsubcategories.map((subsub) => (
                                  <Link
                                    key={subsub.id}
                                    to={`/kategori/${subsub.id}`}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-primary-600"
                                  >
                                    {subsub.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Other menu items */}
            {otherMenuItems.map((item) => (
              item.scrollTo ? (
                <button
                  key={item.id}
                  onClick={scrollToFooter}
                  className="text-gray-700 hover:text-primary-600 py-2 cursor-pointer"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.id}
                  to={`/${item.id}`}
                  className="text-gray-700 hover:text-primary-600 py-2"
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Right side icons - Desktop only */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-primary-600">
              <Search className="h-5 w-5" />
            </button>

            {/* User Account */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="p-2 text-gray-600 hover:text-primary-600 flex items-center"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </button>
                
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/nabis-admin-panel-2024"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          🔧 Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Dalja
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/hyrje" className="p-2 text-gray-600 hover:text-primary-600">
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Shopping Cart */}
            <Link to="/shporta" className="p-2 text-gray-600 hover:text-primary-600 relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-primary-600"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className="flex items-center justify-between w-full px-3 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    <span>{item.name}</span>
                    {item.subcategories && (
                      <ChevronDown 
                        className={`h-5 w-5 transition-transform duration-200 ${
                          activeDropdown === item.id ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>

                  {/* Mobile Dropdown */}
                  {item.subcategories && activeDropdown === item.id && (
                    <div className="pl-6 space-y-1">
                      {item.subcategories.map((subcat) => (
                        <div key={subcat.id}>
                          <Link
                            to={`/kategori/${subcat.id}`}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subcat.name}
                          </Link>
                          {/* Sub-subcategories for mobile */}
                          {subcat.subcategories && (
                            <div className="pl-4 space-y-1 mt-1">
                              {subcat.subcategories.map((subsubcat) => (
                                <Link
                                  key={subsubcat.id}
                                  to={`/kategori/${subsubcat.id}`}
                                  className="block px-3 py-2 text-xs text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-md border-l-2 border-gray-200"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {subsubcat.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Other menu items in mobile */}
              {otherMenuItems.map((item) => (
                item.scrollTo ? (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollToFooter()
                      setIsMenuOpen(false)
                    }}
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 text-left w-full"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    to={`/${item.id}`}
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}

              {/* Mobile Actions */}
              <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
                {/* Search */}
                <button className="flex items-center w-full px-3 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">
                  <Search className="h-5 w-5 mr-3" />
                  <span>Kërkoni</span>
                </button>

                {/* Shopping Cart */}
                <Link
                  to="/shporta"
                  className="flex items-center w-full px-3 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="relative mr-3">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                  <span>Shporta ({cartItems.length})</span>
                </Link>
              </div>

              {/* User Account Mobile */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                {user ? (
                  <div>
                    <div className="px-3 py-2 text-sm text-gray-600">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/nabis-admin-panel-2024"
                        className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        🔧 Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Dalja
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/hyrje"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Hyrje
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
