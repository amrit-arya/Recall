import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSafeRedirect } from '@/lib/utils/redirect'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next')

  // M1 FIX: Ensure next parameter is a safe relative internal path
  const safeNext = getSafeRedirect(rawNext, '/dashboard')

  // H1 FIX: Use trusted site URL from environment or request origin, rather than unvalidated x-forwarded-host
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${safeNext}`)
    }
  }

  // Return user to login page with error notice
  return NextResponse.redirect(`${baseUrl}/login?error=Could%20not%20authenticate%20user`)
}
