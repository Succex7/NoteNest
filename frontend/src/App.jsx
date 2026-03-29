// src/App.jsx — With React lazy loading for better performance

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotesProvider } from './context/NotesContext'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load all pages — they only load when the user navigates to them
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NotesPage = lazy(() => import('./pages/NotesPage'))
const NoteEditorPage = lazy(() => import('./pages/NoteEditorPage'))
const FolderPage = lazy(() => import('./pages/FolderPage'))
const AIToolsPage = lazy(() => import('./pages/AIToolsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Simple page-level loading fallback
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotesProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/notes/:id" element={<NoteEditorPage />} />
                  <Route path="/folders/:id" element={<FolderPage />} />
                  <Route path="/ai-tools" element={<AIToolsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                border: '1px solid var(--border)',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: 'white' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: 'white' },
              },
            }}
          />
        </NotesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}