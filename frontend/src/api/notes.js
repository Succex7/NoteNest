// src/api/notes.js — Notes API calls

import api from './axios'

export const createNote = (data) => api.post('/notes', data)
export const getNotes = (params) => api.get('/notes', { params })
export const getNoteById = (id) => api.get(`/notes/${id}`)
export const updateNote = (id, data) => api.put(`/notes/${id}`, data)
export const deleteNote = (id) => api.delete(`/notes/${id}`)
export const bulkDeleteNotes = (noteIds) => api.delete('/notes/bulk-delete', { data: { noteIds } })
export const searchNotes = (q) => api.get('/notes/search', { params: { q } })