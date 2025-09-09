import React, { useState, useEffect } from 'react'
import { authApi } from '../config/auth'
import { AuthContext } from './AuthContextDefinition'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        // Try to parse saved user data
        const userData = JSON.parse(savedUser)
        
        // Verify token with backend
        authApi.get('/auth/verify')
          .then(() => {
            // Token is valid, restore user data
            setUser(userData)
          })
          .catch((error) => {
            // Token is invalid, clear everything
            console.warn('Token verification failed:', error.response?.data?.error)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          })
          .finally(() => {
            setIsLoading(false)
          })
      } catch (error) {
        // Error parsing user data, clear everything
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authApi.post('/auth/login', { email, password })
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setUser(response.data.user)
        return { success: true, user: response.data.user }
      }
      
      return { success: false, error: 'Token nuk u gjet' }
    } catch (error) {
      const errorData = error.response?.data
      const message = errorData?.error || 'Gabim në sistem. Provoni përsëri.'
      
      // Check if error is due to unverified email
      if (errorData?.requiresVerification) {
        return { 
          success: false, 
          error: message,
          requiresVerification: true,
          email: errorData.email
        }
      }
      
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      await authApi.post('/auth/register', userData)
      
      // Registration successful, but user needs to verify email
      // Don't automatically log in, just return success
      return { 
        success: true, 
        message: 'Regjistrimi u krye me sukses. Kontrolloni email-in për verifikim.',
        requiresVerification: true 
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Gabim në regjistrim. Provoni përsëri.'
      throw new Error(message)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Optionally redirect to home page
    window.location.href = '/'
  }

  const isAdmin = () => {
    return user && user.role === 'admin'
  }

  const isLoggedIn = () => {
    return user !== null
  }

  const updateProfile = async (profileData) => {
    try {
      await authApi.put('/auth/profile', profileData)
      // Refresh user data
      const response = await authApi.get('/auth/profile')
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Gabim në përditësimin e profilit'
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    isLoggedIn,
    isLoading,
    updateProfile,
    api: authApi // Export api instance for use in other components
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
