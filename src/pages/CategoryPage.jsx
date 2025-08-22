import React from 'react'
import { useParams } from 'react-router-dom'

const CategoryPage = () => {
  const { categoryId } = useParams()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Kategoria: {categoryId}
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600">
            Faqja e kategorisë do të implementohet së shpejti...
          </p>
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
