// src/api/folders.js — Folders API calls

import api from './axios'

export const createFolder = (name) => api.post('/folders', { name })
export const getFolders = () => api.get('/folders')
export const renameFolder = (id, name) => api.put(`/folders/${id}`, { name })
export const deleteFolder = (id, deleteNotes = false) =>
  api.delete(`/folders/${id}${deleteNotes ? '?deleteNotes=true' : ''}`)