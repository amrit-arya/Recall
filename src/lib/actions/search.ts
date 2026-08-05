'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { STORAGE_BUCKET } from '@/lib/supabase/storage'
import type { Memory, Session, MemoryType, SessionStatus } from '@/types'

export type SearchFilterType = 'all' | 'memories' | 'sessions'

export interface UniversalSearchResult {
  memories: Memory[]
  sessions: Session[]
  totalCount: number
}

export interface ActionResponse<T = undefined> {
  success?: boolean
  data?: T
  error?: string
}

interface RawMemoryRow {
  id: string
  user_id: string
  title: string
  type: MemoryType
  content: string | null
  url: string | null
  description: string | null
  ai_summary: string | null
  collection: string | null
  attachment_path: string | null
  created_at: string
  memory_tags?: { tags: { name: string } | null }[]
  session_memories?: { session_id: string }[]
}

interface RawTagMemoryJoin {
  memory_id: string
  tags: { name: string } | null
  memories: RawMemoryRow | null
}

/** Sanitize query input for safe ILIKE pattern matching */
function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .slice(0, 100)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

export async function searchUniversalAction(
  rawQuery: string,
  filterType: SearchFilterType = 'all'
): Promise<ActionResponse<UniversalSearchResult>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to perform a search.' }
    }

    const cleanQuery = rawQuery.trim()
    if (!cleanQuery) {
      return {
        success: true,
        data: { memories: [], sessions: [], totalCount: 0 },
      }
    }

    const safePattern = `%${sanitizeSearchQuery(cleanQuery)}%`
    const supabase = await createClient()

    let matchedMemories: Memory[] = []
    let matchedSessions: Session[] = []

    // 1. Search Memories
    if (filterType === 'all' || filterType === 'memories') {
      // Find memories matching title, content, description, url, collection or joined tags
      const { data: memoryRows, error: memError } = await supabase
        .from('memories')
        .select(`
          *,
          memory_tags (
            tags ( name )
          ),
          session_memories (
            session_id
          )
        `)
        .eq('user_id', user.id)
        .or(
          `title.ilike.${safePattern},description.ilike.${safePattern},content.ilike.${safePattern},url.ilike.${safePattern},collection.ilike.${safePattern}`
        )
        .order('created_at', { ascending: false })
        .limit(20)

      if (memError) {
        console.error('Search memories error:', memError)
      }

      // Also search memories by tag match
      const { data: tagMemoryData } = await supabase
        .from('memory_tags')
        .select(`
          memory_id,
          tags!inner(name),
          memories!inner(
            *,
            memory_tags (
              tags ( name )
            ),
            session_memories (
              session_id
            )
          )
        `)
        .ilike('tags.name', safePattern)
        .eq('memories.user_id', user.id)
        .limit(20)

      const combinedMap = new Map<string, RawMemoryRow>()

      if (memoryRows) {
        (memoryRows as unknown as RawMemoryRow[]).forEach((m) => combinedMap.set(m.id, m))
      }

      if (tagMemoryData) {
        (tagMemoryData as unknown as RawTagMemoryJoin[]).forEach((tm) => {
          if (tm.memories && tm.memories.user_id === user.id) {
            combinedMap.set(tm.memories.id, tm.memories)
          }
        })
      }

      const allMatchedRows = Array.from(combinedMap.values())

      // Rank exact title matches higher
      allMatchedRows.sort((a, b) => {
        const q = cleanQuery.toLowerCase()
        const aTitle = a.title.toLowerCase()
        const bTitle = b.title.toLowerCase()
        if (aTitle.includes(q) && !bTitle.includes(q)) return -1
        if (!aTitle.includes(q) && bTitle.includes(q)) return 1
        return 0
      })

      // Resolve signed URLs for memories
      matchedMemories = await Promise.all(
        allMatchedRows.map(async (row) => {
          const tags: string[] = Array.isArray(row.memory_tags)
            ? row.memory_tags
                .map((mt) => mt.tags?.name)
                .filter((name): name is string => typeof name === 'string')
            : []

          const sessionIds: string[] = Array.isArray(row.session_memories)
            ? row.session_memories
                .map((sm) => sm.session_id)
                .filter((id): id is string => typeof id === 'string')
            : []

          let attachmentUrl: string | undefined = undefined
          if (row.attachment_path) {
            try {
              const { data } = await supabase.storage
                .from(STORAGE_BUCKET)
                .createSignedUrl(row.attachment_path, 3600)
              attachmentUrl = data?.signedUrl || undefined
            } catch (err) {
              console.warn('Signed URL resolution error during search:', err)
            }
          }

          return {
            id: row.id,
            title: row.title,
            content: row.content || undefined,
            url: row.url || undefined,
            type: row.type,
            description: row.description || undefined,
            aiSummary: row.ai_summary || undefined,
            collection: row.collection || undefined,
            attachmentUrl,
            createdAt: row.created_at,
            tags,
            sessionIds,
          }
        })
      )
    }

    // 2. Search Sessions
    if (filterType === 'all' || filterType === 'sessions') {
      const { data: sessionRows, error: sessError } = await supabase
        .from('sessions')
        .select(`
          *,
          session_memories (
            memory_id
          )
        `)
        .eq('user_id', user.id)
        .or(
          `name.ilike.${safePattern},description.ilike.${safePattern},progress.ilike.${safePattern},next_step.ilike.${safePattern}`
        )
        .order('updated_at', { ascending: false })
        .limit(20)

      if (sessError) {
        console.error('Search sessions error:', sessError)
      }

      if (sessionRows) {
        // Rank exact name matches higher
        sessionRows.sort((a, b) => {
          const q = cleanQuery.toLowerCase()
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()
          if (aName.includes(q) && !bName.includes(q)) return -1
          if (!aName.includes(q) && bName.includes(q)) return 1
          return 0
        })

        matchedSessions = sessionRows.map((row) => {
          const memoryCount = Array.isArray(row.session_memories)
            ? row.session_memories.length
            : 0

          return {
            id: row.id,
            name: row.name,
            description: row.description || undefined,
            startTime: row.start_time || row.created_at,
            endTime: row.end_time || undefined,
            progress: row.progress || undefined,
            nextStep: row.next_step || undefined,
            status: row.status as SessionStatus,
            memoryCount,
          }
        })
      }
    }

    const totalCount = matchedMemories.length + matchedSessions.length

    return {
      success: true,
      data: {
        memories: matchedMemories,
        sessions: matchedSessions,
        totalCount,
      },
    }
  } catch (err) {
    console.error('searchUniversalAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected search error occurred.' }
  }
}
