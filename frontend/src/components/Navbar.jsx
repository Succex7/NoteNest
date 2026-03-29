// src/components/Navbar.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Settings, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'
import { searchNotes } from '../api/notes'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { getInitials } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { setAllNotes } = useNotes()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await searchNotes(searchQuery.trim())
      setAllNotes(res.data.data)
      navigate('/notes')
    } catch {
      toast.error('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)] md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo — desktop only */}
        <div className="hidden md:block">
          <Logo href="/dashboard" />
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-1 justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="search"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--secondary)]/50 py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              {getInitials(user?.username)}
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-10 z-20 w-56 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
                  <div className="flex items-center gap-3 border-b border-[var(--border)] p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)]">
                      {getInitials(user?.username)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{user?.username}</p>
                      <p className="truncate text-xs text-[var(--muted-foreground)]">{user?.email}</p>
                    </div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { navigate('/settings'); setProfileOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}