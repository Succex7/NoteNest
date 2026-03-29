// src/pages/NoteEditorPage.jsx

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, FolderInput, MoreVertical, Paperclip,
  Save, Sparkles, Trash2, X,
} from 'lucide-react'
import { useNotes } from '../context/NotesContext'
import { createNote, getNoteById, updateNote, deleteNote } from '../api/notes'
import { uploadFile, deleteFile } from '../api/upload'
import { getFolders } from '../api/folders'
import DashboardLayout from '../components/DashboardLayout'
import AIPanel from '../components/AiPanel'
import FilePreview from '../components/FilePreview'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function NoteEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addNote, updateNoteLocal, removeNote, folders, setAllFolders } = useNotes()
  const fileInputRef = useRef(null)

  const isNew = id === 'new'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [folderId, setFolderId] = useState(null)
  const [fileAttachment, setFileAttachment] = useState(null)
  const [noteId, setNoteId] = useState(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [folderMenuOpen, setFolderMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(!isNew)

  // Load existing note
  useEffect(() => {
    const loadData = async () => {
      try {
        const foldersRes = await getFolders()
        setAllFolders(foldersRes.data.data)

        if (!isNew) {
          const noteRes = await getNoteById(id)
          const note = noteRes.data.data
          setTitle(note.title)
          setContent(note.content || '')
          setFolderId(note.folder?._id || note.folder || null)
          setNoteId(note._id)
          if (note.fileUrl) {
            setFileAttachment({
              url: note.fileUrl,
              name: note.filePublicId?.split('/').pop() || 'Attached file',
              type: note.fileType,
            })
          }
        }
      } catch (err) {
        toast.error(getErrorMessage(err))
        navigate('/notes')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please add a title to your note')
      return
    }
    setIsSaving(true)
    try {
      if (isNew) {
        const res = await createNote({ title: title.trim(), content, folderId })
        const newNote = res.data.data
        addNote(newNote)
        setNoteId(newNote._id)
        toast.success('Note created!')
        navigate(`/notes/${newNote._id}`, { replace: true })
      } else {
        const res = await updateNote(id, { title: title.trim(), content, folderId })
        updateNoteLocal(id, res.data.data)
        toast.success('Note saved!')
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteNote(id)
      removeNote(id)
      toast.success('Note deleted')
      navigate('/notes')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // If note is new, save first before uploading
    const currentNoteId = noteId || id
    if (!currentNoteId || isNew) {
      toast.error('Please save the note first before attaching a file')
      return
    }

    setIsUploading(true)
    try {
      const res = await uploadFile(currentNoteId, file)
      const { fileUrl, fileType } = res.data.data
      setFileAttachment({ url: fileUrl, name: file.name, type: fileType })
      updateNoteLocal(currentNoteId, { fileUrl, fileType })
      toast.success('File uploaded!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = async () => {
    const currentNoteId = noteId || id
    if (!currentNoteId || isNew) return
    try {
      await deleteFile(currentNoteId)
      setFileAttachment(null)
      updateNoteLocal(currentNoteId, { fileUrl: null, fileType: null })
      toast.success('File removed')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleMoveToFolder = async (newFolderId) => {
    setFolderId(newFolderId)
    setFolderMenuOpen(false)
    if (!isNew) {
      try {
        await updateNote(id, { folderId: newFolderId || null })
        updateNoteLocal(id, { folder: newFolderId || null })
        toast.success(newFolderId ? 'Folder assigned' : 'Removed from folder')
      } catch (err) {
        toast.error(getErrorMessage(err))
      }
    }
  }

  const currentFolder = folders.find((f) => f._id === folderId)
  const currentNoteId = noteId || (isNew ? null : id)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="relative mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none md:text-2xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            {!isNew && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)]"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
                      {/* Move to folder */}
                      <div className="group/sub relative">
                        <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]">
                          <FolderInput className="h-4 w-4" /> Move to folder
                        </button>
                        <div className="absolute left-full top-0 hidden w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg group-hover/sub:block">
                          <button
                            onClick={() => { handleMoveToFolder(null); setMenuOpen(false) }}
                            className="w-full px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                          >
                            No folder
                          </button>
                          {folders.map((f) => (
                            <button
                              key={f._id}
                              onClick={() => { handleMoveToFolder(f._id); setMenuOpen(false) }}
                              className="w-full px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                            >
                              {f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="my-1 border-t border-[var(--border)]" />
                      <button
                        onClick={() => { setMenuOpen(false); setDeleteDialogOpen(true) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" /> Delete note
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Folder indicator */}
        {currentFolder && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--secondary)] px-3 py-1 text-sm text-[var(--muted-foreground)]">
              <FolderInput className="h-3 w-3" />
              {currentFolder.name}
              <button onClick={() => handleMoveToFolder(null)}>
                <X className="ml-1 h-3 w-3 hover:text-[var(--foreground)]" />
              </button>
            </span>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-hidden py-4">
          <textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full w-full resize-none bg-transparent text-base leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
          />
        </div>

        {/* File attachment preview */}
        {fileAttachment && (
          <div className="mb-4">
            <FilePreview
              fileName={fileAttachment.name}
              fileType={fileAttachment.type === 'pdf' ? 'application/pdf' : fileAttachment.type}
              onRemove={handleRemoveFile}
            />
          </div>
        )}

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-2">
            {/* Folder picker */}
            <div className="relative">
              <button
                onClick={() => setFolderMenuOpen(!folderMenuOpen)}
                className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
              >
                <FolderInput className="h-4 w-4" />
                <span className="hidden sm:inline">{currentFolder ? currentFolder.name : 'Folder'}</span>
              </button>
              {folderMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFolderMenuOpen(false)} />
                  <div className="absolute bottom-10 left-0 z-20 w-48 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
                    <button
                      onClick={() => handleMoveToFolder(null)}
                      className="w-full px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                    >
                      No folder
                    </button>
                    <div className="border-t border-[var(--border)]" />
                    {folders.map((f) => (
                      <button
                        key={f._id}
                        onClick={() => handleMoveToFolder(f._id)}
                        className="w-full px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* File upload */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,image/*"
            />
            <button
              onClick={() => {
                if (isNew) { toast.error('Save the note first before attaching a file'); return }
                fileInputRef.current?.click()
              }}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)] disabled:opacity-50"
            >
              <Paperclip className="h-4 w-4" />
              <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Attach'}</span>
            </button>

            {/* AI button */}
            <button
              onClick={() => {
                if (isNew) { toast.error('Save the note first to use AI features'); return }
                setAiPanelOpen(!aiPanelOpen)
              }}
              className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>

          {/* Delete button */}
          {!isNew && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>

        {/* AI Panel */}
        <AIPanel
          isOpen={aiPanelOpen}
          onClose={() => setAiPanelOpen(false)}
          noteId={currentNoteId}
          noteContent={content}
          hasFile={!!fileAttachment}
          fileType={fileAttachment?.type}
        />

        {/* Delete dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteDialogOpen(false)} />
            <div className="relative w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
              <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">Delete Note</h2>
              <p className="mb-6 text-sm text-[var(--muted-foreground)]">
                Are you sure you want to delete this note? This action cannot be undone.
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
                  disabled={isDeleting}
                  className="flex-1 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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