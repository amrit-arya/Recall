'use client'

import { useState } from 'react'
import type { Memory } from '@/types'
import { MemoryModal } from '@/components/memories/memory-modal'
import { DeleteMemoryDialog } from '@/components/memories/delete-memory-dialog'
import { Edit, Trash2, ExternalLink } from 'lucide-react'

interface MemoryDetailActionsProps {
  memory: Memory
}

export function MemoryDetailActions({ memory }: MemoryDetailActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        {memory.url && (
          <a
            href={memory.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <span>Visit URL</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          <Edit className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <MemoryModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialMemory={memory}
      />

      <DeleteMemoryDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        memoryId={memory.id}
        memoryTitle={memory.title}
        redirectToMemories={true}
      />
    </>
  )
}
