'use client'

import { useState } from 'react'
import type { Memory } from '@/types'
import { MemoryCard } from '@/components/memories/memory-card'
import { AttachMemoryModal } from '@/components/sessions/attach-memory-modal'
import { detachMemoryFromSessionAction } from '@/lib/actions/session-memories'
import { Paperclip, Plus, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SessionMemorySectionProps {
  sessionId: string
  allMemories: Memory[]
  attachedMemories: Memory[]
}

export function SessionMemorySection({
  sessionId,
  allMemories,
  attachedMemories,
}: SessionMemorySectionProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detachingId, setDetachingId] = useState<string | null>(null)

  const attachedMemoryIds = attachedMemories.map((m) => m.id)

  async function handleDetach(memoryId: string) {
    setDetachingId(memoryId)
    await detachMemoryFromSessionAction(sessionId, memoryId)
    setDetachingId(null)
    router.refresh()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">
              Attached Memories ({attachedMemories.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Attach Memory</span>
          </button>
        </div>

        {attachedMemories.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground space-y-3">
            <p>No memories attached to this session yet. Attach relevant links, notes, or snippets to keep your work context connected.</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Attach First Memory</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attachedMemories.map((memory) => (
              <div key={memory.id} className="relative group">
                <MemoryCard memory={memory} />
                <button
                  type="button"
                  title="Detach from session"
                  onClick={() => handleDetach(memory.id)}
                  disabled={detachingId === memory.id}
                  className="absolute top-2 right-2 rounded-md border border-border bg-background/90 p-1 text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  {detachingId === memory.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AttachMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessionId={sessionId}
        allMemories={allMemories}
        attachedMemoryIds={attachedMemoryIds}
      />
    </>
  )
}
