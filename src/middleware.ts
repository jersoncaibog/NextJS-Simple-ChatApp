import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname
    console.log('Middleware: Path:', pathname)

    // Skip middleware for auth callback and public routes
    if (pathname.startsWith('/auth/callback')) {
      console.log('Middleware: Skipping auth callback route')
      return NextResponse.next()
    }

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Refresh session if expired
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log("session", session)
    console.log("sessionError", sessionError)

    if (sessionError) {
      console.error('Middleware: Session error:', sessionError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const isAuthPage = pathname === '/login'
    console.log('Middleware: Auth check:', { hasSession: !!session, isAuthPage })

    // Redirect if not authenticated
    if (!session && !isAuthPage) {
      console.log('Middleware: Redirecting to login - no session')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect if authenticated but on login page
    if (session && isAuthPage) {
      console.log('Middleware: Redirecting to home - has session')
      return NextResponse.redirect(new URL('/', request.url))
    }

    console.log("end of middleware")
    return res
  } catch (error) {
    console.error('Middleware: Error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 