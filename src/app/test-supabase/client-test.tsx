'use client'

import { useEffect, useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

export function ClientSupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function checkClient() {
      try {
        const supabase = createBrowserClient()
        const { error } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          setStatus('error')
          setErrorMessage(error.message)
        } else {
          setStatus('success')
        }
      } catch (err) {
        if (!isMounted) return
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : String(err))
      }
    }

    checkClient()

    return () => {
      isMounted = false
    }
  }, [])

  if (status === 'loading') {
    return <p className="text-sm text-muted-foreground">Testing browser client initialization...</p>
  }

  if (status === 'error') {
    return (
      <div className="space-y-1">
        <p className="text-red-600 font-medium">Browser Client Initialization Failed</p>
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>
    )
  }

  return (
    <p className="text-green-600 font-medium">
      Browser Client Initialized Successfully!
    </p>
  )
}
