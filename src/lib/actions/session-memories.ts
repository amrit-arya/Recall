'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { revalidatePath } from 'next/cache'

export interface ActionResponse<T = undefined> {
  success?: boolean
  data?: T
  error?: string
}

export async function attachMemoryToSessionAction(
  sessionId: string,
  memoryId: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to attach memories.' }
    }

    if (!sessionId || !memoryId) {
      return { error: 'Session ID and Memory ID are required.' }
    }

    const supabase = await createClient()

    // 1. Verify ownership of session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (sessionError || !session) {
      return { error: 'Session not found or permission denied.' }
    }

    // 2. Verify ownership of memory
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .select('id')
      .eq('id', memoryId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (memoryError || !memory) {
      return { error: 'Memory not found or permission denied.' }
    }

    // 3. Insert junction entry (prevent duplicate via composite PK or no-op)
    const { error: insertError } = await supabase
      .from('session_memories')
      .insert({
        session_id: sessionId,
        memory_id: memoryId,
      })

    // Ignore duplicate key errors (code 23505) gracefully
    if (insertError && insertError.code !== '23505') {
      console.error('Attach memory error:', insertError)
      return { error: insertError.message }
    }

    revalidatePath('/sessions')
    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath('/memories')
    revalidatePath(`/memories/${memoryId}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('attachMemoryToSessionAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

export async function detachMemoryFromSessionAction(
  sessionId: string,
  memoryId: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to detach memories.' }
    }

    if (!sessionId || !memoryId) {
      return { error: 'Session ID and Memory ID are required.' }
    }

    const supabase = await createClient()

    // Verify ownership of session
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!session) {
      return { error: 'Session not found or permission denied.' }
    }

    const { error: deleteError } = await supabase
      .from('session_memories')
      .delete()
      .eq('session_id', sessionId)
      .eq('memory_id', memoryId)

    if (deleteError) {
      console.error('Detach memory error:', deleteError)
      return { error: deleteError.message }
    }

    revalidatePath('/sessions')
    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath('/memories')
    revalidatePath(`/memories/${memoryId}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('detachMemoryFromSessionAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}
