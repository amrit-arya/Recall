import { createClient as createServerClient } from './server'
import { createClient as createBrowserClient } from './client'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/types/database'

/**
 * Server-side helper to retrieve the authenticated user.
 * Always uses supabase.auth.getUser() to validate the token against the Supabase Auth server.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  return user
}

/**
 * Server-side helper to retrieve the current user's profile.
 */
export async function getCurrentProfile(): Promise<Tables<'profiles'> | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createServerClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return null
  }

  return profile
}

/**
 * Client-side helper to sign out the user.
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}
