/**
 * Supabase client and server utilities for RECALL.
 * 
 * Safe Server/Client Separation:
 * - Client components MUST import from '@/lib/supabase/client'
 * - Server components / actions MUST import from '@/lib/supabase/server' or '@/lib/supabase/auth'
 */

export type { Database } from '@/types/database'
