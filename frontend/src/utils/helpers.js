// src/utils/helpers.js — Utility functions

// Merge class names (like cn from shadcn)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Format date nicely
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

// Get initials from name
export function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get error message from API error
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  )
}

// Truncate text
export function truncate(text, length = 120) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}