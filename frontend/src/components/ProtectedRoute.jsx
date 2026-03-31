// src/components/ProtectedRoute.jsx — FINAL FIX

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, authLoading } = useAuth()

  // Still checking auth — show loader, don't redirect yet
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Auth check done — no user means redirect to login
  return user ? <Outlet /> : <Navigate to="/login" replace />
}