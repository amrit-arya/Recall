'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMemoryAction } from '@/lib/actions/memories'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteMemoryDialogProps {
  isOpen: boolean
  onClose: () => void
  memoryId: string
  memoryTitle: string
  redirectToMemories?: boolean
}

export function DeleteMemoryDialog({
  isOpen,
  onClose,
  memoryId,
  memoryTitle,
  redirectToMemories = false,
}: DeleteMemoryDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleDelete() {
    setError(null)
    setLoading(true)

    const res = await deleteMemoryAction(memoryId)

    if (res.error) {
      setError(res.error)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()

    if (redirectToMemories) {
      router.push('/memories')
    } else {
      router.refresh()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Delete Memory</h3>
            <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-foreground/90">
          Are you sure you want to delete &quot;<span className="font-semibold">{memoryTitle}</span>&quot;?
        </p>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Memory</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
