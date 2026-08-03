'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { revalidatePath } from 'next/cache'
import type { MemoryType } from '@/types'

export interface MemoryInput {
  title: string
  type: MemoryType
  content?: string
  url?: string
  description?: string
  collection?: string
  tags?: string[]
}

export interface ActionResponse<T = undefined> {
  success?: boolean
  data?: T
  error?: string
}

function validateInput(input: MemoryInput): string | null {
  if (!input.title || !input.title.trim()) {
    return 'Title is required.'
  }

  const validTypes: MemoryType[] = ['url', 'note', 'text', 'code', 'screenshot', 'image', 'pdf']
  if (!validTypes.includes(input.type)) {
    return 'Invalid memory type.'
  }

  if (input.type === 'url') {
    if (!input.url || !input.url.trim()) {
      return 'URL is required for URL type memories.'
    }
    try {
      new URL(input.url.trim().startsWith('http') ? input.url.trim() : `https://${input.url.trim()}`)
    } catch {
      return 'Please enter a valid URL.'
    }
  }

  return null
}

export async function createMemoryAction(
  input: MemoryInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to create a memory.' }
    }

    const validationError = validateInput(input)
    if (validationError) {
      return { error: validationError }
    }

    const supabase = await createClient()

    let formattedUrl = input.url?.trim()
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    // 1. Insert Memory
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .insert({
        user_id: user.id,
        title: input.title.trim(),
        type: input.type,
        content: input.content?.trim() || null,
        url: formattedUrl || null,
        description: input.description?.trim() || null,
        collection: input.collection?.trim() || null,
      })
      .select('id')
      .single()

    if (memoryError || !memory) {
      console.error('Create memory error:', memoryError)
      return { error: memoryError?.message || 'Failed to create memory.' }
    }

    // 2. Handle Tags if provided
    if (input.tags && input.tags.length > 0) {
      const cleanTags = Array.from(new Set(input.tags.map((t) => t.trim()).filter(Boolean)))

      for (const tagName of cleanTags) {
        // Upsert tag
        const { data: tagData } = await supabase
          .from('tags')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', tagName)
          .maybeSingle()

        let tagId = tagData?.id

        if (!tagId) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ user_id: user.id, name: tagName })
            .select('id')
            .single()
          tagId = newTag?.id
        }

        if (tagId) {
          await supabase
            .from('memory_tags')
            .insert({ memory_id: memory.id, tag_id: tagId })
        }
      }
    }

    revalidatePath('/memories')
    revalidatePath('/dashboard')

    return { success: true, data: { id: memory.id } }
  } catch (err) {
    console.error('createMemoryAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

export async function updateMemoryAction(
  id: string,
  input: MemoryInput
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to update a memory.' }
    }

    const validationError = validateInput(input)
    if (validationError) {
      return { error: validationError }
    }

    const supabase = await createClient()

    let formattedUrl = input.url?.trim()
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    // 1. Update Memory (belt and suspenders: eq('id', id).eq('user_id', user.id))
    const { error: updateError } = await supabase
      .from('memories')
      .update({
        title: input.title.trim(),
        type: input.type,
        content: input.content?.trim() || null,
        url: formattedUrl || null,
        description: input.description?.trim() || null,
        collection: input.collection?.trim() || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update memory error:', updateError)
      return { error: updateError.message }
    }

    // 2. Sync Tags: delete existing associations and insert updated ones
    await supabase.from('memory_tags').delete().eq('memory_id', id)

    if (input.tags && input.tags.length > 0) {
      const cleanTags = Array.from(new Set(input.tags.map((t) => t.trim()).filter(Boolean)))

      for (const tagName of cleanTags) {
        const { data: tagData } = await supabase
          .from('tags')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', tagName)
          .maybeSingle()

        let tagId = tagData?.id

        if (!tagId) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ user_id: user.id, name: tagName })
            .select('id')
            .single()
          tagId = newTag?.id
        }

        if (tagId) {
          await supabase
            .from('memory_tags')
            .insert({ memory_id: id, tag_id: tagId })
        }
      }
    }

    revalidatePath('/memories')
    revalidatePath(`/memories/${id}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('updateMemoryAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

export async function deleteMemoryAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to delete a memory.' }
    }

    const supabase = await createClient()

    // Belt-and-suspenders: eq('id', id).eq('user_id', user.id)
    const { error: deleteError } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete memory error:', deleteError)
      return { error: deleteError.message }
    }

    revalidatePath('/memories')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('deleteMemoryAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}
