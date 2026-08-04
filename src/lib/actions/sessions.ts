'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { revalidatePath } from 'next/cache'
import type { SessionStatus } from '@/types'

export interface SessionInput {
  name: string
  description?: string
  progress?: string
  nextStep?: string
}

export interface ActionResponse<T = undefined> {
  success?: boolean
  data?: T
  error?: string
}

export async function createSessionAction(
  input: SessionInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to create a session.' }
    }

    if (!input.name || !input.name.trim()) {
      return { error: 'Session name is required.' }
    }

    const supabase = await createClient()

    const { data: session, error: insertError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        progress: input.progress?.trim() || null,
        next_step: input.nextStep?.trim() || null,
        status: 'active',
        start_time: new Date().toISOString(),
        end_time: null,
      })
      .select('id')
      .single()

    if (insertError || !session) {
      console.error('Create session error:', insertError)
      return { error: insertError?.message || 'Failed to create session.' }
    }

    revalidatePath('/sessions')
    revalidatePath('/dashboard')

    return { success: true, data: { id: session.id } }
  } catch (err) {
    console.error('createSessionAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

export async function updateSessionAction(
  id: string,
  input: SessionInput
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to update a session.' }
    }

    if (!input.name || !input.name.trim()) {
      return { error: 'Session name is required.' }
    }

    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        progress: input.progress?.trim() || null,
        next_step: input.nextStep?.trim() || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update session error:', updateError)
      return { error: updateError.message }
    }

    revalidatePath('/sessions')
    revalidatePath(`/sessions/${id}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('updateSessionAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

export async function deleteSessionAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to delete a session.' }
    }

    const supabase = await createClient()

    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete session error:', deleteError)
      return { error: deleteError.message }
    }

    revalidatePath('/sessions')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('deleteSessionAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Enforces valid state transitions:
 * active -> paused
 * active -> completed (sets end_time = now())
 * paused -> active
 * paused -> completed (sets end_time = now())
 * completed -> active (explicit restart action, resets end_time = null)
 */
export async function transitionSessionStatusAction(
  id: string,
  targetStatus: SessionStatus
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'You must be signed in to modify session status.' }
    }

    const supabase = await createClient()

    // 1. Fetch current session status
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('status, start_time')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !session) {
      return { error: 'Session not found.' }
    }

    const currentStatus = session.status as SessionStatus

    if (currentStatus === targetStatus) {
      return { success: true }
    }

    // 2. Validate allowed transitions
    const validTransitions: Record<SessionStatus, SessionStatus[]> = {
      active: ['paused', 'completed'],
      paused: ['active', 'completed'],
      completed: ['active'], // Explicit restart
    }

    if (!validTransitions[currentStatus]?.includes(targetStatus)) {
      return {
        error: `Cannot transition session status from '${currentStatus}' to '${targetStatus}'.`,
      }
    }

    // 3. Determine time fields
    const updateData: {
      status: SessionStatus
      end_time?: string | null
      start_time?: string
    } = {
      status: targetStatus,
    }

    if (targetStatus === 'completed') {
      updateData.end_time = new Date().toISOString()
    } else if (targetStatus === 'active' && currentStatus === 'completed') {
      // Re-activating a completed session
      updateData.end_time = null
      if (!session.start_time) {
        updateData.start_time = new Date().toISOString()
      }
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Transition session status error:', updateError)
      return { error: updateError.message }
    }

    revalidatePath('/sessions')
    revalidatePath(`/sessions/${id}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('transitionSessionStatusAction exception:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}
