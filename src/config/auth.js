// Auth utilities and API configuration
import axios from 'axios'
import { API_URL } from './api'

// Configure axios instance
export const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

// Add token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Add response interceptor to handle token expiration
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is expired or invalid, clear auth state
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.error
      if (errorMessage === 'Access token i kërkuar' || errorMessage === 'Token i pavlefshëm') {
        // Don't clear if it's just a missing token on initial load
        const currentPath = window.location.pathname
        if (currentPath !== '/' && localStorage.getItem('token')) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.reload()
        }
      }
    }
    return Promise.reject(error)
  }
)
