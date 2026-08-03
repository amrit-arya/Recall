'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { LogOut, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignOutButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'menu'
  showText?: boolean
}

export function SignOutButton({
  className,
  variant = 'default',
  showText = true,
}: SignOutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Sign out error:', err)
      setLoading(false)
    }
  }

  if (variant === 'menu') {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer',
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          <LogOut className="h-4 w-4 shrink-0" />
        )}
        {showText && <span>{loading ? 'Signing out...' : 'Sign Out'}</span>}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 cursor-pointer',
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      {showText && <span>{loading ? 'Signing out...' : 'Sign Out'}</span>}
    </button>
  )
}
