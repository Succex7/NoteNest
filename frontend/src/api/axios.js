// src/api/axios.js — Axios instance (FIXED)

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Set token immediately on module load if it exists in localStorage
// This ensures token is available even before AuthContext mounts
const storedToken = localStorage.getItem('notenest_token')
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
}

// Attach token to every request (fallback interceptor)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('notenest_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on auth pages
      const isAuthPage = ['/login', '/register', '/forgot-password'].some(
        (path) => window.location.pathname.startsWith(path)
      )
      if (!isAuthPage) {
        localStorage.removeItem('notenest_token')
        localStorage.removeItem('notenest_user')
        delete api.defaults.headers.common['Authorization']
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api