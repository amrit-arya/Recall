'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient as createBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getSafeRedirect } from '@/lib/utils/redirect'
import { LogIn, Loader2, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get('next')
  const safeNext = getSafeRedirect(rawNext, '/dashboard')
  const initialError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isSupabaseConfigured()) {
      setError(
        'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing in Vercel project settings.'
      )
      return
    }

    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      router.push(safeNext)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-foreground">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-foreground">
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Continue</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-3 border-t border-border/40">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-xs text-muted-foreground">
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
