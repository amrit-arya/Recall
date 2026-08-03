'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Memory, MemoryType } from '@/types'
import { createMemoryAction, updateMemoryAction, type MemoryInput } from '@/lib/actions/memories'
import { X, Loader2, Link as LinkIcon, FileText, Code, AlignLeft, Sparkles } from 'lucide-react'

interface MemoryModalProps {
  isOpen: boolean
  onClose: () => void
  initialMemory?: Memory | null
}

const memoryTypes: { label: string; value: MemoryType; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'URL', value: 'url', icon: LinkIcon },
  { label: 'Note', value: 'note', icon: FileText },
  { label: 'Text', value: 'text', icon: AlignLeft },
  { label: 'Code', value: 'code', icon: Code },
]

function MemoryModalForm({
  initialMemory,
  onClose,
}: {
  initialMemory?: Memory | null
  onClose: () => void
}) {
  const router = useRouter()
  const isEditing = Boolean(initialMemory)

  const [title, setTitle] = useState(initialMemory?.title || '')
  const [type, setType] = useState<MemoryType>(
    initialMemory && ['url', 'note', 'text', 'code'].includes(initialMemory.type)
      ? initialMemory.type
      : 'note'
  )
  const [url, setUrl] = useState(initialMemory?.url || '')
  const [content, setContent] = useState(initialMemory?.content || '')
  const [description, setDescription] = useState(initialMemory?.description || '')
  const [collection, setCollection] = useState(initialMemory?.collection || '')
  const [tagsInput, setTagsInput] = useState(initialMemory?.tags ? initialMemory.tags.join(', ') : '')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    if (type === 'url' && !url.trim()) {
      setError('URL is required for URL type memories.')
      return
    }

    setLoading(true)

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)

    const payload: MemoryInput = {
      title: title.trim(),
      type,
      url: url.trim() || undefined,
      content: content.trim() || undefined,
      description: description.trim() || undefined,
      collection: collection.trim() || undefined,
      tags: parsedTags,
    }

    const res = isEditing && initialMemory
      ? await updateMemoryAction(initialMemory.id, payload)
      : await createMemoryAction(payload)

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
      className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5 my-8 transition-all"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            {isEditing ? 'Edit Memory' : 'Capture New Memory'}
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
        {/* Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Memory Type</label>
          <div className="grid grid-cols-4 gap-2">
            {memoryTypes.map((t) => {
              const Icon = t.icon
              const selected = type === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all cursor-pointer ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="memory-title" className="text-xs font-medium text-foreground">
            Title *
          </label>
          <input
            id="memory-title"
            type="text"
            required
            placeholder="e.g. Next.js App Router Documentation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        {/* URL (shown if type === 'url' or optional) */}
        {(type === 'url' || url) && (
          <div className="space-y-1.5">
            <label htmlFor="memory-url" className="text-xs font-medium text-foreground">
              URL {type === 'url' ? '*' : '(Optional)'}
            </label>
            <input
              id="memory-url"
              type="text"
              required={type === 'url'}
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-1.5">
          <label htmlFor="memory-content" className="text-xs font-medium text-foreground">
            {type === 'code' ? 'Code Snippet' : 'Content / Notes'}
          </label>
          <textarea
            id="memory-content"
            rows={type === 'code' ? 5 : 3}
            placeholder={
              type === 'code'
                ? '// Paste your code snippet here...'
                : 'Enter details, text, or reference notes...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${
              type === 'code' ? 'font-mono text-xs' : ''
            }`}
          />
        </div>

        {/* Description / Summary */}
        <div className="space-y-1.5">
          <label htmlFor="memory-description" className="text-xs font-medium text-foreground">
            Short Description / Context (Optional)
          </label>
          <input
            id="memory-description"
            type="text"
            placeholder="Brief summary or context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        {/* Collection & Tags Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="memory-collection" className="text-xs font-medium text-foreground">
              Collection (Category)
            </label>
            <input
              id="memory-collection"
              type="text"
              placeholder="e.g. Research, Projects"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="memory-tags" className="text-xs font-medium text-foreground">
              Tags (Comma separated)
            </label>
            <input
              id="memory-tags"
              type="text"
              placeholder="nextjs, supabase, auth"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
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
                <span>{isEditing ? 'Saving...' : 'Capturing...'}</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Capture Memory'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export function MemoryModal({ isOpen, onClose, initialMemory }: MemoryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <MemoryModalForm
        key={initialMemory?.id || 'new-memory'}
        initialMemory={initialMemory}
        onClose={onClose}
      />
    </div>
  )
}
