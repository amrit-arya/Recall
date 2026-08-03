import { getCurrentUser } from '@/lib/supabase/auth'
import { ClientSupabaseTest } from './client-test'

export const dynamic = 'force-dynamic'

export default async function TestSupabasePage() {
  let serverStatus = 'unknown'
  let serverError: string | null = null
  let userId: string | null = null

  try {
    const user = await getCurrentUser()
    serverStatus = 'success'
    userId = user?.id ?? null
  } catch (err) {
    serverStatus = 'error'
    serverError = err instanceof Error ? err.message : String(err)
  }

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6 font-sans">
      <h1 className="text-2xl font-bold">Supabase Initialization Verification</h1>

      <div className="border p-4 rounded-lg bg-card space-y-2">
        <h2 className="text-lg font-semibold">1. Server Client Verification</h2>
        <p>
          Status:{' '}
          <span
            className={
              serverStatus === 'success'
                ? 'text-green-600 font-medium'
                : 'text-red-600 font-medium'
            }
          >
            {serverStatus === 'success'
              ? 'Server Client Initialized Successfully!'
              : 'Failed'}
          </span>
        </p>
        {userId && <p className="text-sm text-muted-foreground">User ID: {userId}</p>}
        {serverStatus === 'success' && !userId && (
          <p className="text-sm text-muted-foreground">
            No active session found (expected for unauthenticated user).
          </p>
        )}
        {serverError && (
          <p className="text-sm text-red-500">Error: {serverError}</p>
        )}
      </div>

      <div className="border p-4 rounded-lg bg-card space-y-2">
        <h2 className="text-lg font-semibold">2. Browser Client Verification</h2>
        <ClientSupabaseTest />
      </div>
    </div>
  )
}
