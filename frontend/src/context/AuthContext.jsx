import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('notenest_token')
    if (!token) {
      setAuthLoading(false)
      return
    }
    getMe()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('notenest_token')
        localStorage.removeItem('notenest_user')
      })
      .finally(() => setAuthLoading(false))
  }, [])

  const login = (userData, token) => {
    // Write token to localStorage FIRST — interceptor reads it fresh
    localStorage.setItem('notenest_token', token)
    localStorage.setItem('notenest_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('notenest_token')
    localStorage.removeItem('notenest_user')
    setUser(null)
  }

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }))
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