// API Configuration
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
export const API_BASE_URL = `http://${hostname}:3001`
export const API_URL = `${API_BASE_URL}/api`

// Fallback API base URL for development
export const FALLBACK_API_URL = 'http://localhost:3001/api'
