// src/pages/FolderPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileText, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNotes } from '../context/NotesContext'
import { getNotes } from '../api/notes'
import { getFolders, renameFolder, deleteFolder } from '../api/folders'
import DashboardLayout from '../components/DashboardLayout'
import NoteCard from '../components/NoteCard'
import EmptyState from '../components/EmptyState'
import { NoteGridSkeleton } from '../components/Skeleton'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function FolderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notes, folders, setAllNotes, setAllFolders, updateFolderLocal, removeFolderLocal } = useNotes()
  const [isLoading, setIsLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const folder = folders.find((f) => f._id === id)
  const folderNotes = notes.filter((n) => {
    const noteFolderId = n.folder?._id || n.folder
    return noteFolderId === id
  })

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
}, [id])


  useEffect(() => {
    if (folder) setNewName(folder.name)
  }, [folder])

  const handleRename = async () => {
    if (!newName.trim()) return
    setIsRenaming(true)
    try {
      await renameFolder(id, newName.trim())
      updateFolderLocal(id, newName.trim())
      toast.success('Folder renamed!')
      setRenameDialogOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteFolder(id, false)
      removeFolderLocal(id)
      toast.success('Folder deleted — notes moved to Uncategorized')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (!isLoading && !folder) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={FileText}
          title="Folder not found"
          description="The folder you're looking for doesn't exist."
          actionLabel="Go to Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {folder?.name || '...'}
              </h1>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)]"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute left-0 top-9 z-20 w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
                      <button
                        onClick={() => { setMenuOpen(false); setRenameDialogOpen(true) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                      >
                        <Pencil className="h-4 w-4" /> Rename
                      </button>
                      <div className="border-t border-[var(--border)]" />
                      <button
                        onClick={() => { setMenuOpen(false); setDeleteDialogOpen(true) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="mt-1 text-[var(--muted-foreground)]">
              {isLoading ? '...' : `${folderNotes.length} ${folderNotes.length === 1 ? 'note' : 'notes'}`}
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

        {/* Notes */}
        {isLoading ? (
          <NoteGridSkeleton count={6} />
        ) : folderNotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="This folder is empty"
            description="Create a new note or move existing notes into this folder."
            actionLabel="Create note"
            onAction={() => navigate('/notes/new')}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folderNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => navigate('/notes/new')}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg transition-opacity hover:opacity-90 md:hidden"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Rename dialog */}
        {renameDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setRenameDialogOpen(false)} />
            <div className="relative w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
              <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Rename Folder</h2>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
                className="mb-4 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setRenameDialogOpen(false)}
                  className="flex-1 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--secondary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  disabled={isRenaming}
                  className="flex-1 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
                >
                  {isRenaming ? 'Renaming...' : 'Rename'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteDialogOpen(false)} />
            <div className="relative w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
              <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">Delete Folder</h2>
              <p className="mb-6 text-sm text-[var(--muted-foreground)]">
                Are you sure you want to delete "{folder?.name}"? Notes inside will be moved to Uncategorized.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--secondary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}