// src/components/Sidebar.jsx

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderPlus,
  Home,
  LogOut,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'
import { createFolder } from '../api/folders'
import Logo from './Logo'
import { cn, getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/notes', icon: FileText, label: 'All Notes' },
  { href: '/ai-tools', icon: Sparkles, label: 'AI Tools' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { folders, addFolder } = useNotes()
  const [foldersExpanded, setFoldersExpanded] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    setCreating(true)
    try {
      const res = await createFolder(newFolderName.trim())
      addFolder(res.data.data)
      setNewFolderName('')
      setDialogOpen(false)
      toast.success('Folder created!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card transition-transform duration-300 md:sticky md:top-0 md:z-0 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Logo href="/dashboard" />
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Folders section */}
          <div className="mt-6">
            <button
              onClick={() => setFoldersExpanded(!foldersExpanded)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Folders
              </span>
              {foldersExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {foldersExpanded && (
              <ul className="mt-1 space-y-1 pl-4">
                {folders.map((folder) => (
                  <li key={folder._id}>
                    <Link
                      to={`/folders/${folder._id}`}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                        location.pathname === `/folders/${folder._id}`
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <Folder className="h-4 w-4" />
                      <span className="truncate">{folder.name}</span>
                    </Link>
                  </li>
                ))}

                {/* New folder button */}
                <li>
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <FolderPlus className="h-4 w-4" />
                    New Folder
                  </button>
                </li>
              </ul>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Create folder dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Create New Folder</h2>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
              className="mb-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setDialogOpen(false)}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={creating || !newFolderName.trim()}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}