import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'

const AuthContext = createContext()

// Configure axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token with backend
      api.get('/auth/verify')
        .then(response => {
          setUser(response.data.user)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
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
      const response = await api.post('/auth/register', userData)
      
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
  }

  const isAdmin = () => {
    return user && user.role === 'admin'
  }

  const isLoggedIn = () => {
    return user !== null
  }

  const updateProfile = async (profileData) => {
    try {
      await api.put('/auth/profile', profileData)
      // Refresh user data
      const response = await api.get('/auth/profile')
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
    api // Export api instance for use in other components
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
