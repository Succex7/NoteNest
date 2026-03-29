// src/components/Logo.jsx

import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../utils/helpers'

export default function Logo({ size = 'md', href = '/', className }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
  const iconSizes = { sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-8 w-8' }

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center justify-center rounded-lg bg-[var(--primary)] p-1.5">
        <FileText className={cn('text-[var(--primary-foreground)]', iconSizes[size])} />
      </div>
      <span className={cn('font-bold text-[var(--foreground)]', sizes[size])}>NoteNest</span>
    </div>
  )

  return (
    <Link to={href} className="transition-opacity hover:opacity-80">
      {content}
    </Link>
  )
}