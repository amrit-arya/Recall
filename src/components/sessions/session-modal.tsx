'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@/types'
import { createSessionAction, updateSessionAction, type SessionInput } from '@/lib/actions/sessions'
import { X, Loader2, PlayCircle, Sparkles } from 'lucide-react'

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  initialSession?: Session | null
}

function SessionModalForm({
  initialSession,
  onClose,
}: {
  initialSession?: Session | null
  onClose: () => void
}) {
  const router = useRouter()
  const isEditing = Boolean(initialSession)

  const [name, setName] = useState(initialSession?.name || '')
  const [description, setDescription] = useState(initialSession?.description || '')
  const [progress, setProgress] = useState(initialSession?.progress || '')
  const [nextStep, setNextStep] = useState(initialSession?.nextStep || '')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Session name is required.')
      return
    }

    setLoading(true)

    const payload: SessionInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      progress: progress.trim() || undefined,
      nextStep: nextStep.trim() || undefined,
    }

    const res = isEditing && initialSession
      ? await updateSessionAction(initialSession.id, payload)
      : await createSessionAction(payload)

    if (res.error) {
      setError(res.error)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div
      className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5 my-8 transition-all"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Sparkles className="h-5 w-5 text-primary" />
          ) : (
            <PlayCircle className="h-5 w-5 text-primary" />
          )}
          <h2 className="text-lg font-bold text-foreground">
            {isEditing ? 'Edit Session' : 'Start New Session'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="session-name" className="text-xs font-medium text-foreground">
            Session Name *
          </label>
          <input
            id="session-name"
            type="text"
            required
            placeholder="e.g. Supabase Auth Refactor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="session-description" className="text-xs font-medium text-foreground">
            Description / Context (Optional)
          </label>
          <textarea
            id="session-description"
            rows={3}
            placeholder="What are you focusing on in this work session?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        {/* Progress & Next Step */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="session-progress" className="text-xs font-medium text-foreground">
              Progress Status (Optional)
            </label>
            <input
              id="session-progress"
              type="text"
              placeholder="e.g. 50% or 3/5 tasks"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="session-next-step" className="text-xs font-medium text-foreground">
              Next Step (Optional)
            </label>
            <input
              id="session-next-step"
              type="text"
              placeholder="e.g. Implement callback route"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Actions */}
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
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isEditing ? 'Saving...' : 'Starting...'}</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Start Session'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export function SessionModal({ isOpen, onClose, initialSession }: SessionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <SessionModalForm
        key={initialSession?.id || 'new-session'}
        initialSession={initialSession}
        onClose={onClose}
      />
    </div>
  )
}
