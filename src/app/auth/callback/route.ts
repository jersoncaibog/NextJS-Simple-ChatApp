import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    console.log("auth/callback")
    console.log(requestUrl)
    console.log(code)

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    if (!session) {
      console.error('No session established after code exchange')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    console.log('Auth success - Session established:', { userId: session.user.id })
    
    // Set the session cookie
    const response = NextResponse.redirect(new URL('/', requestUrl.origin))
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    
    console.log('Redirecting to home page after successful auth')
    
    return response
  } catch (error) {
    console.error('Callback route error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 