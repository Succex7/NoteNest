// src/pages/RegisterPage.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../api/auth'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!formData.username.trim()) e.username = 'Username is required'
    else if (formData.username.length < 2) e.username = 'Username must be at least 2 characters'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const res = await registerUser(formData)
      const token = res.data.data.token
      const userData = res.data.data
      login(userData, token)
      toast.success('Account created successfully!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = getErrorMessage(err)
      toast.error(msg)
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: 'An account with this email already exists' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
      errors[field] ? 'border-red-500' : 'border-[var(--border)]'
    }`

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
        <Logo href="/" size="sm" />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Create an account</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Get started with NoteNest for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => { setFormData({ ...formData, username: e.target.value }); if (errors.username) setErrors({ ...errors, username: '' }) }}
                className={inputClass('username')}
              />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }) }}
                className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: '' }) }}
                  className={inputClass('password') + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary-foreground)] border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--primary)] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}