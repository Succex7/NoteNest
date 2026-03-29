// src/api/upload.js — File upload API calls

import api from './axios'

export const uploadFile = (noteId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/upload/${noteId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteFile = (noteId) => api.delete(`/upload/${noteId}`)