import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Key } from 'lucide-react'
import axios from 'axios'

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1) // 1: Enter email, 2: Enter code
  const [formData, setFormData] = useState({
    email: '',
    code: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' })
    }
  }

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await axios.post('http://localhost:3001/api/auth/request-temp-login', {
        email: formData.email
      })

      setMessage({ type: 'success', text: 'Kodi u dërgua në email-in tuaj!' })
      setStep(2)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Gabim në dërgimin e kodit' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginWithCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login-with-code', {
        email: formData.email,
        code: formData.code
      })

      setMessage({ type: 'success', text: 'Hyrja e suksesshme!' })
      
      // Store token AND user data (same as regular login)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Redirect based on user role (same logic as regular login)
      setTimeout(() => {
        if (response.data.user.role === 'admin') {
          window.location.href = '/nabis-admin-panel-2024'
        } else {
          window.location.href = '/'
        }
      }, 1500)
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Kod i gabuar ose i skaduar' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-primary-600">
            Nabis <span className="text-secondary-600">Farmaci</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {step === 1 ? 'Hyrje pa Fjalëkalim' : 'Futni Kodin'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 
              ? 'Do t\'ju dërgojmë një kod 6-shifror për hyrje të përkohshme'
              : 'Kontrolloni email-in tuaj për kodin 6-shifror'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/kycu"
              className="flex items-center text-sm text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kthehu tek hyrja
            </Link>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-3 rounded-md flex items-center space-x-2 ${
              message.type === 'error' 
                ? 'bg-red-50 text-red-800 border border-red-200' 
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {step === 1 ? (
            /* Step 1: Enter Email */
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Futni email-in tuaj"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Duke dërguar kodin...
                    </div>
                  ) : (
                    'Dërgo Kodin'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Enter Code */
            <form onSubmit={handleLoginWithCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Kodi 6-Shifror
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                    value={formData.code}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Kontrolloni email-in tuaj për kodin 6-shifror
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Duke u lidhur...
                    </div>
                  ) : (
                    'Hyni me Kodin'
                  )}
                </button>
              </div>

              {/* Resend Code Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Dërgo kodin sërish
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {step === 1 ? 'Kjo është e sigurt' : 'Kodi është i vlefshëm për 10 minuta'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600">
                Kodi 6-shifror ju lejon të hyni vetëm për këtë herë pa fjalëkalim.
                Pas hyrjes, ju rekomandojmë të ndryshoni fjalëkalimin tuaj.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
