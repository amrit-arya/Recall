'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Memory, MemoryType } from '@/types'
import { createMemoryAction, updateMemoryAction, type MemoryInput } from '@/lib/actions/memories'
import { getUrlMetadataAction } from '@/lib/actions/url-metadata'
import { generateMemoryAISuggestionsAction } from '@/lib/actions/ai-suggestions'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import {
  STORAGE_BUCKET,
  validateAttachmentFile,
  buildStoragePath,
} from '@/lib/supabase/storage'
import {
  X,
  Loader2,
  Link as LinkIcon,
  FileText,
  Code,
  AlignLeft,
  Sparkles,
  Globe,
  ArrowDownLeft,
  Image as ImageIcon,
  FileCheck,
  UploadCloud,
  Wand2,
} from 'lucide-react'

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
  { label: 'Image', value: 'image', icon: ImageIcon },
  { label: 'PDF', value: 'pdf', icon: FileCheck },
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
    initialMemory && ['url', 'note', 'text', 'code', 'image', 'screenshot', 'pdf'].includes(initialMemory.type)
      ? initialMemory.type === 'screenshot' ? 'image' : initialMemory.type
      : 'note'
  )
  const [url, setUrl] = useState(initialMemory?.url || '')
  const [content, setContent] = useState(initialMemory?.content || '')
  const [description, setDescription] = useState(initialMemory?.description || '')
  const [collection, setCollection] = useState(initialMemory?.collection || '')
  const [tagsInput, setTagsInput] = useState(initialMemory?.tags ? initialMemory.tags.join(', ') : '')

  // File Attachment State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI Suggestions state
  const [generatingAI, setGeneratingAI] = useState(false)
  const [aiNotice, setAiNotice] = useState<string | null>(null)

  // URL Metadata state
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [metadataNotice, setMetadataNotice] = useState<string | null>(null)
  const [fetchedMetadata, setFetchedMetadata] = useState<{
    title?: string
    description?: string
    domain?: string
    faviconUrl?: string
  } | null>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateAttachmentFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      setFilePreview(null)
      return
    }

    setSelectedFile(file)

    // Auto-fill title if blank
    if (!title.trim()) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setTitle(cleanTitle)
    }

    // Generate preview thumbnail if image
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file)
      setFilePreview(objectUrl)
    } else {
      setFilePreview(null)
    }
  }

  async function fetchMetadata(targetUrl: string, autoFill: boolean = false) {
    if (!targetUrl || !targetUrl.trim()) return

    setFetchingMetadata(true)
    setMetadataNotice(null)

    try {
      const res = await getUrlMetadataAction(targetUrl.trim())
      setFetchingMetadata(false)

      if (res.success && res.metadata) {
        setFetchedMetadata(res.metadata)

        if (res.metadata.title && (!title.trim() || autoFill)) {
          setTitle(res.metadata.title)
        }
        if (res.metadata.description && (!description.trim() || autoFill)) {
          setDescription(res.metadata.description)
        }

        setMetadataNotice(
          res.metadata.title
            ? `Extracted metadata from ${res.metadata.domain}`
            : `Detected domain: ${res.metadata.domain}`
        )
      } else {
        setMetadataNotice(res.error || 'Could not auto-fetch metadata. You can enter details manually.')
      }
    } catch {
      setFetchingMetadata(false)
      setMetadataNotice('Could not auto-fetch metadata. You can enter details manually.')
    }
  }

  function handleUrlBlur() {
    if (type === 'url' && url.trim() && !fetchedMetadata && !fetchingMetadata) {
      fetchMetadata(url, true)
    }
  }

  async function handleGenerateAISuggestions() {
    if (!title.trim()) {
      setError('Please enter a title first to generate AI suggestions.')
      return
    }

    setGeneratingAI(true)
    setAiNotice(null)
    setError(null)

    const res = await generateMemoryAISuggestionsAction({
      title: title.trim(),
      content: content.trim() || undefined,
      url: url.trim() || undefined,
      type,
      description: description.trim() || undefined,
    })

    setGeneratingAI(false)

    if (res.error) {
      setAiNotice(res.error)
      return
    }

    if (res.data) {
      // Pre-fill summary if user description is blank or updated
      if (res.data.summary) {
        setDescription(res.data.summary)
      }

      // Merge suggested tags with existing input
      if (res.data.suggestedTags && res.data.suggestedTags.length > 0) {
        const existingTags = tagsInput
          .split(',')
          .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
          .filter(Boolean)

        const merged = Array.from(new Set([...existingTags, ...res.data.suggestedTags]))
        setTagsInput(merged.join(', '))
      }

      // Pre-fill collection if currently blank
      if (res.data.suggestedCollection && !collection.trim()) {
        setCollection(res.data.suggestedCollection)
      }

      setAiNotice('✨ AI suggestions applied! Review and edit fields before saving.')
    }
  }

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

    if ((type === 'image' || type === 'pdf') && !selectedFile && !isEditing && !initialMemory?.attachmentUrl) {
      setError(`Please select a ${type.toUpperCase()} file to upload.`)
      return
    }

    setLoading(true)

    let attachmentPath: string | undefined = undefined

    // Upload attachment to private Supabase storage bucket if selected
    if (selectedFile) {
      setUploadingFile(true)
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('You must be logged in to upload attachments.')
          setLoading(false)
          setUploadingFile(false)
          return
        }

        const path = buildStoragePath(user.id, selectedFile.name)

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, selectedFile, {
            contentType: selectedFile.type,
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          setError(`File upload failed: ${uploadError.message}`)
          setLoading(false)
          setUploadingFile(false)
          return
        }

        attachmentPath = path
      } catch (uploadErr) {
        console.error('Storage upload exception:', uploadErr)
        setError('File upload failed. Please try again.')
        setLoading(false)
        setUploadingFile(false)
        return
      }
    }

    setUploadingFile(false)

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
      attachmentPath: attachmentPath || (isEditing ? initialMemory?.attachmentUrl : undefined),
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateAISuggestions}
            disabled={generatingAI || loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
            title="Generate AI summary, tags, and category"
          >
            {generatingAI ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 text-primary" />
            )}
            <span>Auto-suggest with AI</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {aiNotice && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-2.5 text-xs text-primary flex items-center gap-1.5">
          <Wand2 className="h-4 w-4 shrink-0 text-primary" />
          <span>{aiNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Memory Type</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {memoryTypes.map((t) => {
              const Icon = t.icon
              const selected = type === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-medium transition-all cursor-pointer ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[11px]">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* File Picker Section for Image or PDF */}
        {(type === 'image' || type === 'pdf') && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Attachment ({type === 'image' ? 'Image File' : 'PDF Document'}) *
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-background/50 space-y-2">
              <input
                id="file-input"
                type="file"
                accept={type === 'image' ? 'image/png,image/jpeg,image/webp,image/gif' : 'application/pdf'}
                onChange={handleFileSelect}
                disabled={loading}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer space-y-2 block">
                {filePreview ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-36 mx-auto rounded-lg border border-border object-contain"
                    />
                    <p className="text-xs font-medium text-foreground">{selectedFile?.name}</p>
                    <p className="text-[10px] text-muted-foreground">Click to change image</p>
                  </div>
                ) : selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <span>{selectedFile.name} ({ (selectedFile.size / (1024 * 1024)).toFixed(1) } MB)</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-xs font-medium text-foreground">
                      Click to choose {type === 'image' ? 'an Image' : 'a PDF'} file
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {type === 'image' ? 'PNG, JPG, WEBP, GIF' : 'PDF documents'} up to 10 MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

        {/* URL Input (shown if type === 'url' or optional) */}
        {(type === 'url' || url) && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="memory-url" className="text-xs font-medium text-foreground">
                URL {type === 'url' ? '*' : '(Optional)'}
              </label>
              {url.trim() && (
                <button
                  type="button"
                  onClick={() => fetchMetadata(url, true)}
                  disabled={fetchingMetadata || loading}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {fetchingMetadata ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      <span>Auto-fetch metadata</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              id="memory-url"
              type="text"
              required={type === 'url'}
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            {metadataNotice && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <Globe className="h-3 w-3 text-primary shrink-0" />
                <span>{metadataNotice}</span>
              </p>
            )}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="memory-title" className="text-xs font-medium text-foreground">
              Title *
            </label>
            {fetchedMetadata?.title && title !== fetchedMetadata.title && (
              <button
                type="button"
                onClick={() => setTitle(fetchedMetadata.title || '')}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
              >
                <ArrowDownLeft className="h-3 w-3" />
                <span>Use generated title</span>
              </button>
            )}
          </div>
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

        {/* Content */}
        {type !== 'image' && type !== 'pdf' && (
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
        )}

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
                <span>{uploadingFile ? 'Uploading file...' : isEditing ? 'Saving...' : 'Capturing...'}</span>
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
