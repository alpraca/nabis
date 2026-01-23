// API Configuration
const isProduction = import.meta.env.PROD
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const API_BASE_URL = isProduction 
  ? apiUrl 
  : 'http://localhost:3001'
  
export const API_URL = `${API_BASE_URL}/api`

// Fallback API base URL for development
export const FALLBACK_API_URL = 'http://localhost:3001/api'

