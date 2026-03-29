// src/pages/NotesPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { useNotes } from '../context/NotesContext'
import { getNotes } from '../api/notes'
import { getFolders } from '../api/folders'
import DashboardLayout from '../components/DashboardLayout'
import NoteCard from '../components/NoteCard'
import EmptyState from '../components/EmptyState'
import { NoteGridSkeleton } from '../components/Skeleton'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function NotesPage() {
  const navigate = useNavigate()
  const { notes, setAllNotes, setAllFolders } = useNotes()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, foldersRes] = await Promise.all([getNotes(), getFolders()])
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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">All Notes</h1>
            <p className="mt-1 text-[var(--muted-foreground)]">
              {isLoading ? '...' : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} total`}
            </p>
          </div>
          <button
            onClick={() => navigate('/notes/new')}
            className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        {/* Notes grid */}
        {isLoading ? (
          <NoteGridSkeleton count={9} />
        ) : notes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No notes yet"
            description="Create your first note to get started."
            actionLabel="Create note"
            onAction={() => navigate('/notes/new')}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}

        {/* FAB — mobile */}
        <button
          onClick={() => navigate('/notes/new')}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg transition-opacity hover:opacity-90 md:hidden"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </DashboardLayout>
  )
}