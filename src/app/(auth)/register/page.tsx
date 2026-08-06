'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient as createBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!isSupabaseConfigured()) {
      setError(
        'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing in Vercel project settings.'
      )
      return
    }

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserClient()

      // 1. Sign up user
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim() || email.split('@')[0],
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // 2. Only upsert profile if active session exists
        if (data.session) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              display_name: displayName.trim() || email.split('@')[0],
            })

          if (profileError) {
            console.warn('Profile creation note:', profileError.message)
          }

          router.push('/dashboard')
          router.refresh()
          return
        } else {
          // Email confirmation is required
          setSuccessMessage(
            'Account created successfully! Please check your email to confirm your account before logging in.'
          )
          setLoading(false)
        }
      }
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

      {successMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-xs font-medium text-foreground">
              Display Name (Optional)
            </label>
            <input
              id="displayName"
              type="text"
              placeholder="Alex Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground">
              Email Address *
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
            <label htmlFor="password" className="text-xs font-medium text-foreground">
              Password *
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-muted-foreground pt-3 border-t border-border/40">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
