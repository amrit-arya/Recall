'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SessionStatus } from '@/types'
import { transitionSessionStatusAction } from '@/lib/actions/sessions'
import { Pause, Play, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react'

interface SessionStatusControlsProps {
  sessionId: string
  status: SessionStatus
}

export function SessionStatusControls({ sessionId, status }: SessionStatusControlsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmReactivate, setConfirmReactivate] = useState(false)

  async function handleTransition(targetStatus: SessionStatus) {
    setLoading(true)
    setError(null)

    const res = await transitionSessionStatusAction(sessionId, targetStatus)
    setLoading(false)

    if (res.error) {
      setError(res.error)
      return
    }

    setConfirmReactivate(false)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <div className="flex items-center gap-2">
        {status === 'active' && (
          <>
            <button
              type="button"
              onClick={() => handleTransition('paused')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
              <span>Pause</span>
            </button>

            <button
              type="button"
              onClick={() => handleTransition('completed')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>Complete Session</span>
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              type="button"
              onClick={() => handleTransition('active')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              <span>Resume Session</span>
            </button>

            <button
              type="button"
              onClick={() => handleTransition('completed')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>Complete Session</span>
            </button>
          </>
        )}

        {status === 'completed' && (
          <>
            {!confirmReactivate ? (
              <button
                type="button"
                onClick={() => setConfirmReactivate(true)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reactivate Session</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Reactivate this session?</span>
                <button
                  type="button"
                  onClick={() => handleTransition('active')}
                  disabled={loading}
                  className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReactivate(false)}
                  disabled={loading}
                  className="text-xs text-muted-foreground hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
