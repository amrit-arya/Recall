import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { getSafeRedirect } from '@/lib/utils/redirect'

const PROTECTED_PREFIXES = ['/dashboard', '/memories', '/sessions', '/settings', '/timeline']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isRootRoute = pathname === '/'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // C1 FIX: Fail closed if Supabase credentials are missing at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedRoute || isRootRoute) {
      console.error('[Middleware] Supabase environment variables missing. Access denied to protected route:', pathname)
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'Authentication service unavailable')
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Unauthenticated user trying to access protected routes or root -> redirect to /login
  if (!user && (isProtectedRoute || isRootRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    if (isProtectedRoute) {
      url.searchParams.set('next', getSafeRedirect(pathname))
    }
    return NextResponse.redirect(url)
  }

  // 2. Authenticated user trying to access auth routes or root -> redirect to /dashboard
  if (user && (isAuthRoute || isRootRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
