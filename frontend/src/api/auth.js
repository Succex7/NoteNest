// src/api/auth.js — Auth API calls

import api from './axios'

export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')
export const updateProfile = (data) => api.put('/auth/update-profile', data)
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) => api.put(`/auth/reset-password/${token}`, { password })
export const deleteAccount = () => api.delete('/auth/delete-account')