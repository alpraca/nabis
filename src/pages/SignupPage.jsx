import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
})

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Emri është i nevojshëm'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Mbiemri është i nevojshëm'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email-i është i nevojshëm'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email-i nuk është valid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Numri i telefonit është i nevojshëm'
    }

    if (!formData.password) {
      newErrors.password = 'Fjalëkalimi është i nevojshëm'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Fjalëkalimi duhet të ketë së paku 6 karaktere'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Fjalëkalimi duhet të përmbajë të paktën një shkronjë të madhe, një të vogël dhe një numër'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Fjalëkalimet nuk përputhen'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Duhet të pranoni termat dhe kushtet'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      }

      // Call registration endpoint - this will send verification code
      const response = await api.post('/auth/register', userData)
      
      if (response.data.requiresVerification) {
        setUserEmail(formData.email)
        setShowVerificationForm(true)
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      // Extract specific error message from backend
      let errorMessage = 'Gabim në regjistrimin e llogarisë'

      if (error.response?.data) {
        const resp = error.response.data
        // If the backend provided detailed validation messages, show them
        if (Array.isArray(resp.details) && resp.details.length > 0) {
          errorMessage = resp.details.join('; ')
        } else if (resp.error || resp.message) {
          errorMessage = resp.error || resp.message
        }
      }

      console.log('📋 Backend error:', errorMessage)

      setErrors({
        submit: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerificationSubmit = async (e) => {
    e.preventDefault()
    
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verification: 'Ju lutemi futni kodin 6-shifror' })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Try to verify the code with backend
      const response = await api.post('/auth/verify-registration', {
        email: userEmail,
        code: verificationCode
      })

      console.log('✅ Verification successful:', response.data)
      
      // Save token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      
      // First show verification success message
      setShowVerificationSuccess(true)
      setErrors({}) // Clear any errors
      
      // Then after 2 seconds, show the final success page
      setTimeout(() => {
        setShowSuccessMessage(true)
      }, 2000)
      
    } catch (error) {
      console.log('❌ Verification error:', error)
      
      // Check if it's actually a success disguised as an error
      const errorResponse = error.response?.data
      
      // If we have success message or token in the error response, it's actually success
      if (errorResponse && 
          (errorResponse.message?.includes('sukses') || 
           errorResponse.message?.includes('success') ||
           errorResponse.message?.includes('krijua') ||
           errorResponse.token)) {
        
        console.log('🎉 Success found in error response:', errorResponse)
        if (errorResponse.token) {
          localStorage.setItem('token', errorResponse.token)
        }
        
        // First show verification success message
        setShowVerificationSuccess(true)
        setErrors({}) // Clear any errors
        
        // Then after 2 seconds, show the final success page
        setTimeout(() => {
          setShowSuccessMessage(true)
        }, 2000)
      } else {
        // Real error - show error message
        setErrors({ 
          verification: errorResponse?.message || 'Kodi i verifikimit është i gabuar ose ka skaduar.'
        })
      }
    } finally {
      setIsSubmitting(false)
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
            Krijoni llogarinë tuaj
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ose{' '}
            <Link
              to="/hyrje"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              hyni në llogarinë ekzistuese
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showVerificationSuccess ? (
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  ✅ U VERIFIKUA ME SUKSES!
                </h3>
                <p className="text-green-700 font-medium">
                  Kodi juaj i verifikimit është i saktë dhe llogaria është krijuar!
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Link
                  to="/hyrje"
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                >
                  <span>Kthehu tek logini</span>
                  <span className="text-xl">→</span>
                </Link>
              </div>
            </div>
          ) : showVerificationForm ? (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verifikoni Email-in Tuaj
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Dërguam një kod 6-shifror në <strong>{userEmail}</strong>. 
                Futni kodin për të përfunduar regjistrimin.
              </p>
              
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      if (errors.verification) {
                        setErrors(prev => ({ ...prev, verification: '' }))
                      }
                    }}
                    className={`block w-full px-3 py-3 border rounded-md text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.verification ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                    maxLength="6"
                  />
                  {errors.verification && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errors.verification}</p>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Duke verifikuar...
                    </div>
                  ) : (
                    'Verifikoni Kodin'
                  )}
                </button>
              </form>
              
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowVerificationForm(false)
                    setVerificationCode('')
                    setErrors({})
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Kthehu te formulari i regjistrimit
                </button>
              </div>
            </div>
          ) : showSuccessMessage ? (
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Verifikimi i Suksesshëm!
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Llogaria juaj është krijuar dhe verifikuar!
                </h3>
                <p className="text-green-700">
                  Email: <strong className="text-green-900">{userEmail}</strong>
                </p>
              </div>
              <p className="text-gray-600 mb-6">
                Tani mund të hyni në llogarinë tuaj dhe të filloni të blini nga Nabis Farmaci.
              </p>
              <div className="space-y-3">
                <Link
                  to="/hyrje"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors block text-center text-lg"
                >
                  🔑 Hyr në Llogari
                </Link>
                <Link
                  to="/"
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors block text-center"
                >
                  ← Kthehu në Ballina
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Emri
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Emri"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Mbiemri
                    </label>
                    <div className="mt-1">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Mbiemri"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
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
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Email-i juaj"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefoni
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+355 69 123 4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Fjalëkalimi
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Fjalëkalimi juaj"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Konfirmoni Fjalëkalimin
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Konfirmoni fjalëkalimin"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        required
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                        Pranoj{' '}
                        <Link to="/termat" className="text-primary-600 hover:text-primary-500">
                          Termat dhe Kushtet
                        </Link>{' '}
                        dhe{' '}
                        <Link to="/privatesia" className="text-primary-600 hover:text-primary-500">
                          Politikën e Privatësisë
                        </Link>
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="subscribeNewsletter"
                      name="subscribeNewsletter"
                      type="checkbox"
                      checked={formData.subscribeNewsletter}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-gray-900">
                      Dua të marr newsletter-in dhe ofertat speciale
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  {errors.submit && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Duke u regjistruar...
                      </div>
                    ) : (
                      'Krijoni Llogarinë'
                    )}
                  </button>
                </div>
              </form>

              {/* Social Signup Options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Ose regjistrohuni me</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Regjistrohuni me Google</span>
                    <div className="text-xl">🔍</div>
                  </button>

                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Regjistrohuni me Facebook</span>
                    <div className="text-xl">📘</div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignupPage
