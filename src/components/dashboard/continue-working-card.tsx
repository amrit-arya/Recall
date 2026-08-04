'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Session } from '@/types'
import { StatusBadge } from '@/components/shared/session-status-badge'
import { formatRelativeTime } from '@/lib/utils'
import { transitionSessionStatusAction } from '@/lib/actions/sessions'
import { Clock, CheckCircle2, Paperclip, Play, Loader2 } from 'lucide-react'

interface ContinueWorkingCardProps {
  session: Session
}

export function ContinueWorkingCard({ session }: ContinueWorkingCardProps) {
  const router = useRouter()
  const [resuming, setResuming] = useState(false)

  async function handleResume(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setResuming(true)

    await transitionSessionStatusAction(session.id, 'active')
    setResuming(false)
    router.refresh()
  }

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-ring/30 hover:shadow-sm space-y-3"
    >
      {/* Top row: Status badge + Session Name + Time */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={session.status} />
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(session.startTime)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {session.name}
          </h3>
        </div>

        {/* Resume action button for paused sessions */}
        {session.status === 'paused' && (
          <button
            type="button"
            onClick={handleResume}
            disabled={resuming}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {resuming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Resume</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Description / Progress Snippet */}
      {session.description && (
        <p className="text-xs text-muted-foreground line-clamp-1">
          {session.description}
        </p>
      )}

      {/* Context Details: Progress & Next Step */}
      <div className="space-y-1.5 pt-1 border-t border-border/40 text-xs">
        {session.progress && (
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span className="truncate">
              <strong className="font-medium text-foreground">Progress:</strong> {session.progress}
            </span>
          </div>
        )}

        {session.nextStep && (
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="truncate">
              <strong className="font-medium text-foreground">Next:</strong> {session.nextStep}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Attached Memories count */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
        <div className="flex items-center gap-1">
          <Paperclip className="h-3.5 w-3.5" />
          <span>{session.memoryCount} attached {session.memoryCount === 1 ? 'memory' : 'memories'}</span>
        </div>
        <span className="font-medium text-primary group-hover:underline">
          Open Session &rarr;
        </span>
      </div>
    </Link>
  )
}
