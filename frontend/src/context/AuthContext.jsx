// src/context/AuthContext.jsx — Auth state management (FIXED)

import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // On mount, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('notenest_token')
    if (!token) {
      setAuthLoading(false)
      return
    }

    // Set token on axios FIRST before making any request
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    getMe()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('notenest_token')
        localStorage.removeItem('notenest_user')
        delete api.defaults.headers.common['Authorization']
      })
      .finally(() => setAuthLoading(false))
  }, [])

  const login = (userData, token) => {
    // Set token on axios instance IMMEDIATELY — before anything else
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    // Then persist to localStorage
    localStorage.setItem('notenest_token', token)
    localStorage.setItem('notenest_user', JSON.stringify(userData))
    // Then update state
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('notenest_token')
    localStorage.removeItem('notenest_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }))
    const stored = localStorage.getItem('notenest_user')
    if (stored) {
      const parsed = JSON.parse(stored)
      localStorage.setItem('notenest_user', JSON.stringify({ ...parsed, ...updatedData }))
    }
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}