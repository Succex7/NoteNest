// src/components/NoteCard.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MoreVertical, Paperclip, Pencil, Trash2, FolderInput } from 'lucide-react'
import { useNotes } from '../context/NotesContext'
import { deleteNote, updateNote } from '../api/notes'
import { formatDate, getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function NoteCard({ note }) {
  const navigate = useNavigate()
  const { folders, removeNote, updateNoteLocal } = useNotes()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const folder = folders.find((f) => f._id === (note.folder?._id || note.folder))

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteNote(note._id)
      removeNote(note._id)
      toast.success('Note deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleMoveToFolder = async (folderId) => {
    try {
      await updateNote(note._id, { folderId: folderId || null })
      updateNoteLocal(note._id, { folder: folderId || null })
      toast.success(folderId ? 'Moved to folder' : 'Removed from folder')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    setMenuOpen(false)
  }

  return (
    <>
      <div className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-md">
        {/* Clickable overlay */}
        <Link to={`/notes/${note._id}`} className="absolute inset-0 z-10 rounded-xl" />

        <div className="p-5">
          {/* Header */}
          <div className="mb-2 flex items-start justify-between">
            <h3 className="flex-1 pr-6 font-semibold text-[var(--foreground)] line-clamp-1">
              {note.title}
            </h3>
            <div className="relative z-20">
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen) }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--secondary)]"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
                    <button
                      onClick={(e) => { e.preventDefault(); navigate(`/notes/${note._id}`); setMenuOpen(false) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>

                    {/* Move to folder submenu */}
                    <div className="group/sub relative">
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]">
                        <FolderInput className="h-4 w-4" /> Move to folder
                      </button>
                      <div className="absolute left-full top-0 hidden w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg group-hover/sub:block">
                        <button
                          onClick={(e) => { e.preventDefault(); handleMoveToFolder(null) }}
                          className="w-full px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                        >
                          No folder
                        </button>
                        {folders.map((f) => (
                          <button
                            key={f._id}
                            onClick={(e) => { e.preventDefault(); handleMoveToFolder(f._id) }}
                            className="w-full px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="my-1 border-t border-[var(--border)]" />
                    <button
                      onClick={(e) => { e.preventDefault(); setMenuOpen(false); setDeleteDialogOpen(true) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content preview */}
          <p className="mb-3 text-sm text-[var(--muted-foreground)] line-clamp-2">
            {note.content || 'No content'}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {folder && (
              <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--secondary-foreground)]">
                {folder.name}
              </span>
            )}
            {note.fileUrl && (
              <span className="flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                <Paperclip className="h-3 w-3" /> File
              </span>
            )}
          </div>

          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {formatDate(note.updatedAt)}
          </p>
        </div>
      </div>

      {/* Delete dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">Delete Note</h2>
            <p className="mb-6 text-sm text-[var(--muted-foreground)]">
              Are you sure you want to delete "{note.title}"? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}