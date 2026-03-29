// src/components/FilePreview.jsx

import { File, FileText, Image, X } from 'lucide-react'

export default function FilePreview({ fileName, fileType, onRemove }) {
  const getIcon = () => {
    if (fileType?.startsWith('image/')) return <Image className="h-5 w-5" />
    if (fileType === 'application/pdf') return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const getLabel = () => {
    if (fileType?.startsWith('image/')) return 'Image'
    if (fileType === 'application/pdf') return 'PDF'
    return 'File'
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/30 p-3">
      <div className="flex items-center justify-center rounded-md bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
        {getIcon()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">{fileName}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{getLabel()}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}