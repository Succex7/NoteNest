// src/api/ai.js — AI API calls

import api from './axios'

export const summarizeNote = (noteId) => api.post(`/ai/summarize/${noteId}`)
export const explainNote = (noteId) => api.post(`/ai/explain/${noteId}`)
export const askAboutNote = (noteId, question) => api.post(`/ai/ask/${noteId}`, { question })
export const generalChat = (message) => api.post('/ai/chat', { message })
export const summarizeFile = (noteId) => api.post(`/ai/summarize-file/${noteId}`)