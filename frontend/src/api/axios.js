// src/api/axios.js 

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Attach token to EVERY request by reading fresh from localStorage each time
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('notenest_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — DO NOT auto-redirect or delete token here
// ProtectedRoute handles auth guarding instead
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default api