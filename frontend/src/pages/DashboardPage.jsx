// src/pages/DashboardPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, FolderOpen, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'
import { getNotes } from '../api/notes'
import { getFolders } from '../api/folders'
import DashboardLayout from '../components/DashboardLayout'
import NoteCard from '../components/NoteCard'
import EmptyState from '../components/EmptyState'
import { NoteGridSkeleton } from '../components/Skeleton'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNewUser = localStorage.getItem('notenest_new_user') === 'true'

useEffect(() => {
  if (isNewUser) {
    localStorage.removeItem('notenest_new_user')
  }
}, [])
  const { notes, folders, setAllNotes, setAllFolders } = useNotes()
  const [isLoading, setIsLoading] = useState(true)

// Reset isNewUser after showing it once
useEffect(() => {
  if (isNewUser) {
    const timer = setTimeout(() => setIsNewUser(false), 5000)
    return () => clearTimeout(timer)
  }
}, [isNewUser])

useEffect(() => {
  // Small guard — wait for token to be ready
  const token = localStorage.getItem('notenest_token')
  if (!token) return

  const fetchData = async () => {
    try {
      const [notesRes, foldersRes] = await Promise.all([
        getNotes(),
        getFolders()
      ])
      setAllNotes(notesRes.data.data)
      setAllFolders(foldersRes.data.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }
  fetchData()
}, [])


  const recentNotes = notes.slice(0, 6)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Welcome */}
        <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
        {isNewUser
        ? `Welcome to NoteNest, ${user?.username?.split(' ')[0] || 'User'}! 🎉`
        : `Welcome back, ${user?.username?.split(' ')[0] || 'User'}! 👋`
        }
        </h1>
          <p className="mt-1 text-muted-foreground">Here's an overview of your notes</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-(--primary)/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Notes</p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '—' : notes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-(--primary)/10 p-3">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Folders</p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '—' : folders.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Notes</h2>
            {notes.length > 0 && (
              <button
                onClick={() => navigate('/notes')}
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </button>
            )}
          </div>

          {isLoading ? (
            <NoteGridSkeleton count={6} />
          ) : notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes yet"
              description="Create your first note to get started with NoteNest."
              actionLabel="Create your first note"
              onAction={() => navigate('/notes/new')}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentNotes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
          )}
        </div>

        {/* FAB — mobile */}
        <button
          onClick={() => navigate('/notes/new')}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90 md:hidden"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </DashboardLayout>
  )
}