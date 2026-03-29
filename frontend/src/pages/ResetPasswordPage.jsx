// src/pages/ResetPasswordPage.jsx

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import { resetPassword } from '../api/auth'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      await resetPassword(token, formData.password)
      setIsSubmitted(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
        <Logo href="/" />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
                <CheckCircle2 className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">Password reset!</h1>
              <p className="mb-6 text-sm text-[var(--muted-foreground)]">
                Your password has been successfully reset.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-md bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
              >
                Continue to login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
                  <Lock className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Reset password</h1>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Enter your new password below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 pr-10 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
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

                {/* Confirm password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 pr-10 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm">
                <Link to="/login" className="font-medium text-[var(--primary)] hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}