'use client'

import { useState, useEffect } from 'react'
import type { Memory, Session } from '@/types'
import { searchUniversalAction, type SearchFilterType } from '@/lib/actions/search'
import { MemoryCard } from '@/components/memories/memory-card'
import { SessionCard } from '@/components/sessions/session-card'
import { Search, X, Loader2, Brain, Clock, Filter } from 'lucide-react'

interface UniversalSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
}

function UniversalSearchContent({
  initialQuery,
  onClose,
}: {
  initialQuery: string
  onClose: () => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [filterType, setFilterType] = useState<SearchFilterType>('all')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [searchedQuery, setSearchedQuery] = useState('')

  // 300ms Debounce Search Execution
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      const resetTimer = setTimeout(() => {
        setMemories([])
        setSessions([])
        setTotalCount(0)
        setSearchedQuery('')
        setLoading(false)
      }, 0)
      return () => clearTimeout(resetTimer)
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      const res = await searchUniversalAction(trimmed, filterType)
      setLoading(false)

      if (res.error) {
        setError(res.error)
        return
      }

      if (res.data) {
        setMemories(res.data.memories)
        setSessions(res.data.sessions)
        setTotalCount(res.data.totalCount)
        setSearchedQuery(trimmed)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, filterType])

  return (
    <div
      className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden transition-all flex flex-col max-h-[85vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Search Input Bar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-background/50">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memories, sessions, tags, or topics..."
          className="flex-1 bg-transparent text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        >
          Esc
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-muted/30 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" />
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-background text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            All Results ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('memories')}
            className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'memories'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-background text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            Memories ({memories.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('sessions')}
            className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'sessions'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-background text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            Sessions ({sessions.length})
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-1.5 text-primary text-xs shrink-0 pl-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Searching...</span>
          </div>
        )}
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!query.trim() ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <Search className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <p className="font-medium text-foreground">Type to search your repository</p>
            <p>Find notes, URLs, code snippets, PDFs, and work sessions by keyword or tag.</p>
          </div>
        ) : !loading && totalCount === 0 && searchedQuery ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <Brain className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <p className="font-medium text-foreground">No matching results</p>
            <p>No memories or sessions found matching &ldquo;{searchedQuery}&rdquo;.</p>
          </div>
        ) : (
          <>
            {/* Memories Section */}
            {(filterType === 'all' || filterType === 'memories') && memories.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Memories ({memories.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memories.map((mem) => (
                    <div key={mem.id} onClick={onClose}>
                      <MemoryCard memory={mem} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions Section */}
            {(filterType === 'all' || filterType === 'sessions') && sessions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Work Sessions ({sessions.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sessions.map((sess) => (
                    <div key={sess.id} onClick={onClose}>
                      <SessionCard session={sess} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function UniversalSearchDialog({
  isOpen,
  onClose,
  initialQuery = '',
}: UniversalSearchDialogProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto pt-16 sm:pt-20"
      onClick={onClose}
    >
      <UniversalSearchContent
        key={isOpen ? 'search-open' : 'search-closed'}
        initialQuery={initialQuery}
        onClose={onClose}
      />
    </div>
  )
}
