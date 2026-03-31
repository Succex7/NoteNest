// src/pages/SettingsPage.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { updateProfile, deleteAccount } from '../api/auth'
import DashboardLayout from '../components/DashboardLayout'
import { getInitials, getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  })

  const handleSaveProfile = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error('Username and email are required')
      return
    }
    setIsSaving(true)
    try {
      const res = await updateProfile(formData)
      updateUser(res.data.data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
      logout()
      navigate('/')
      toast.success('Account deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Profile</h2>
          <p className="mb-6 text-sm text-muted-foreground">Update your personal information</p>

          {/* Avatar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {getInitials(user?.username)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user?.username}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Appearance</h2>
          <p className="mb-6 text-sm text-muted-foreground">Customize how NoteNest looks</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
              </div>
            </div>
            {/* Toggle switch */}
            {/* Toggle switch — FIXED colors */}
          <button
            onClick={toggleTheme}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-white' : 'bg-border'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-transform ${
                theme === 'dark'
                  ? 'translate-x-5 bg-black'   // ← dark mode: black thumb, white track
                  : 'translate-x-0 bg-white'   // ← light mode: white thumb, grey track
              }`}
            />
          </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/30 bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold text-red-500">Danger Zone</h2>
          <p className="mb-6 text-sm text-muted-foreground">Irreversible actions for your account</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="rounded-xl border border-border bg-card p-6">
          <button
            onClick={handleLogout}
            className="w-full rounded-md border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Logout
          </button>
        </div>

        {/* Delete dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteDialogOpen(false)} />
            <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
              <h2 className="mb-2 text-lg font-semibold text-foreground">Delete Account</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Are you sure? This will permanently delete your account and all your notes and folders. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="whitespace-nowrap flex-1 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}