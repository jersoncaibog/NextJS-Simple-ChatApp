import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    console.log('Middleware: Checking session for path:', request.nextUrl.pathname)
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()
    const { data: { user } } = await supabase.auth.getUser()
    
    const isAuthPage = request.nextUrl.pathname === '/login'
    console.log('Middleware: Session status:', { hasSession: !!session, hasUser: !!user, isAuthPage })

    if (!user && !isAuthPage) {
      console.log('Middleware: Redirecting to login - no user')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isAuthPage) {
      console.log('Middleware: Redirecting to home - has user')
      return NextResponse.redirect(new URL('/', request.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*))',
  ]
} 