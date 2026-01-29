import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Pill } from 'lucide-react'
import axios from 'axios'
import { API_URL, API_BASE_URL } from '../config/api'

const Hero = () => {
  const [heroImage, setHeroImage] = useState(null)

  useEffect(() => {
    // Load hero image from backend
    axios.get(`${API_URL}/settings/hero/image`)
      .then(response => {
        setHeroImage(response.data.imageUrl)
      })
      .catch(error => {
        console.error('Error loading hero image:', error)
      })
  }, [])

  const scrollToFooter = () => {
    const footerElement = document.getElementById('kontakt')
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Mirësevini në <span className="text-primary-600">Nabis Farmaci</span>
              </h1>
              <p className="text-xl text-gray-600">
                Farmacia juaj e besuar për produkte farmaceutike dhe dermokozmetike të cilësisë së lartë
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/produktet"
                className="btn-hover bg-primary-600 text-white px-8 py-3 rounded-md font-semibold text-center"
              >
                Shiko Të Gjitha Produktet
              </Link>
              <button
                onClick={scrollToFooter}
                className="btn-hover border border-primary-600 text-primary-600 px-8 py-3 rounded-md font-semibold text-center hover:bg-primary-600 hover:text-white transition-colors duration-300"
              >
                Na Kontaktoni
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600">Produkte në dispozicion</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-secondary-600">24/7</div>
                <div className="text-sm text-gray-600">Mbështetje klienti</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl p-8 h-96">
              {/* Hero Image or Placeholder */}
              <div className="w-full h-full bg-white/70 rounded-2xl flex items-center justify-center overflow-hidden">
                {heroImage ? (
                  <img 
                    src={`${API_BASE_URL}${heroImage}`}
                    alt="Nabis Farmaci" 
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : (
                  <div className="text-center">
                    <div className="flex justify-center mb-4 text-primary-600">
                      <Pill className="w-16 h-16" />
                    </div>
                    <p className="text-gray-600 font-medium">Nabis Farmaci</p>
                    <p className="text-gray-500 text-sm">Shëndeti juaj është prioriteti ynë</p>
                  </div>
                )}
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg">
              <div className="text-center">
                <div className="font-bold">Ulje të</div>
                <div className="text-xs">ÇMENDURA</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-secondary-600 text-white p-4 rounded-full shadow-lg">
              <div className="text-center">
                <div className="font-bold">100%</div>
                <div className="text-xs">E SIGURT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
