import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Search, TrendingUp, PackageOpen } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)

  // Load all products
  const loadAllProducts = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products?limit=50`)
      setSearchResults(response.data.products || [])
    } catch (error) {
      console.error('Error loading products:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load all products when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllProducts()
    }
  }, [isOpen, loadAllProducts])

  // Search products
  useEffect(() => {
    if (!isOpen) return

    const searchProducts = async () => {
      if (searchQuery.trim().length === 0) {
        return // Don't search, modal opening will load products
      }

      if (searchQuery.trim().length < 2) {
        return
      }

      setIsLoading(true)
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(searchQuery)}`)
        setSearchResults(response.data) // Show all results
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, isOpen])

  // Clear search
  const handleClear = () => {
    setSearchQuery('')
    loadAllProducts()
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full">
          {/* Header */}
          <div className="flex items-center border-b border-gray-200 p-4">
            <Search className="h-6 w-6 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kërkoni produkte..."
              className="flex-1 ml-3 text-lg outline-none"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                title="Pastro"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Mbyll"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}

            {!isLoading && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
              <div className="p-8 text-center text-gray-500">
                <p>Nuk u gjetën rezultate për "{searchQuery}"</p>
              </div>
            )}

            {!isLoading && searchResults.length > 0 && (
              <div className="divide-y divide-gray-100">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/produkti/${product.id}`}
                    onClick={handleClose}
                    className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    {product.image_url ? (
                      <img
                        src={`${API_BASE_URL}${product.image_url}`}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<div class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M20.91 8.84 8.56 21.19a2 2 0 0 1-2.83 0l-5.46-5.46a2 2 0 0 1 0-2.83L12.6 .57a2 2 0 0 1 2.83 0l5.46 5.46a2 2 0 0 1 0 2.83Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>'
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <PackageOpen className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                      <p className="text-primary-600 font-semibold mt-1">{product.price} Lek</p>
                    </div>
                    {product.in_stock && product.stock_quantity > 0 ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Në stok
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        Jo në stok
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {searchResults.length > 0 && (
            <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500">
              Duke shfaqur {searchResults.length} rezultate
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
