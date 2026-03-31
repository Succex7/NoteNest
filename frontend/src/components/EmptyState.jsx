// src/components/EmptyState.jsx

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 rounded-full bg-secondary) p-4">
        <Icon className="h-8 w-8 text-muted-foreground)" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground)">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground)">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-md bg-primary) px-4 py-2 text-sm font-medium text-primary-foreground) transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}