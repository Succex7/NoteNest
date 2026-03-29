// src/context/NotesContext.jsx — Notes and folders global state

import { createContext, useContext, useState, useCallback } from 'react'

const NotesContext = createContext()

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])

  // Notes
  const setAllNotes = useCallback((data) => setNotes(data), [])

  const addNote = useCallback((note) => {
    setNotes((prev) => [note, ...prev])
  }, [])

  const updateNoteLocal = useCallback((id, updates) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, ...updates } : n))
    )
  }, [])

  const removeNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n._id !== id))
  }, [])

  // Folders
  const setAllFolders = useCallback((data) => setFolders(data), [])

  const addFolder = useCallback((folder) => {
    setFolders((prev) => [...prev, folder])
  }, [])

  const updateFolderLocal = useCallback((id, name) => {
    setFolders((prev) =>
      prev.map((f) => (f._id === id ? { ...f, name } : f))
    )
  }, [])

  const removeFolderLocal = useCallback((id) => {
    setFolders((prev) => prev.filter((f) => f._id !== id))
    // Unassign notes from deleted folder
    setNotes((prev) =>
      prev.map((n) => (n.folder?._id === id || n.folder === id ? { ...n, folder: null } : n))
    )
  }, [])

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        setAllNotes,
        addNote,
        updateNoteLocal,
        removeNote,
        setAllFolders,
        addFolder,
        updateFolderLocal,
        removeFolderLocal,
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used within NotesProvider')
  return ctx
}