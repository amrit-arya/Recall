'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Memory } from '@/types'
import { attachMemoryToSessionAction, detachMemoryFromSessionAction } from '@/lib/actions/session-memories'
import { MemoryTypeIcon } from '@/components/shared/memory-type-icon'
import { X, Search, Check, Plus, Loader2, Link as LinkIcon } from 'lucide-react'

interface AttachMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  allMemories: Memory[]
  attachedMemoryIds: string[]
}

export function AttachMemoryModal({
  isOpen,
  onClose,
  sessionId,
  allMemories,
  attachedMemoryIds,
}: AttachMemoryModalProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const attachedSet = useMemo(() => new Set(attachedMemoryIds), [attachedMemoryIds])

  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return allMemories

    const q = searchQuery.toLowerCase()
    return allMemories.filter((mem) => {
      const titleMatch = mem.title.toLowerCase().includes(q)
      const descMatch = mem.description?.toLowerCase().includes(q)
      const contentMatch = mem.content?.toLowerCase().includes(q)
      const tagMatch = mem.tags.some((t) => t.toLowerCase().includes(q))
      return titleMatch || descMatch || contentMatch || tagMatch
    })
  }, [allMemories, searchQuery])

  if (!isOpen) return null

  async function handleToggleAttach(memoryId: string, isAttached: boolean) {
    setLoadingId(memoryId)
    setError(null)

    const action = isAttached
      ? detachMemoryFromSessionAction(sessionId, memoryId)
      : attachMemoryToSessionAction(sessionId, memoryId)

    const res = await action
    setLoadingId(null)

    if (res.error) {
      setError(res.error)
      return
    }

    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Attach Memories to Session</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories to attach..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Memories List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 border border-border/50 rounded-xl p-2 bg-background/50">
          {filteredMemories.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {allMemories.length === 0
                ? 'No memories created yet. Capture memories first to attach them to sessions.'
                : 'No memories match your search query.'}
            </p>
          ) : (
            filteredMemories.map((mem) => {
              const isAttached = attachedSet.has(mem.id)
              const isLoading = loadingId === mem.id

              return (
                <div
                  key={mem.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 hover:border-ring/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MemoryTypeIcon type={mem.type} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{mem.title}</p>
                      {mem.description && (
                        <p className="text-[11px] text-muted-foreground truncate">{mem.description}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAttach(mem.id, isAttached)}
                    disabled={isLoading}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all shrink-0 cursor-pointer disabled:opacity-50 ${
                      isAttached
                        ? 'border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                        : 'border border-border bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isAttached ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Attached</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Attach</span>
                      </>
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
          <span>{attachedMemoryIds.length} memory attached</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
