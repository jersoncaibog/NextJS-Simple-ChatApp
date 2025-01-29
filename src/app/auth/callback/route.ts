import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {

  console.log("app/auth/callback/route.ts...")

  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/'

    console.log(requestUrl)
    console.log('Auth Callback: Starting with code:', !!code)

    if (!code) {
      console.error('Auth Callback: No code provided')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    // Use the Supabase client to exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Auth Callback: Session exchange error:', sessionError)
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    if (!session) {
      console.error('Auth Callback: No session established')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    console.log('Auth Callback: Success - Session established for user:', session.user.id)
    
    // Set the session cookie and redirect
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))
    response.headers.set('Cache-Control', 'no-store, max-age=0')

    return response
  } catch (error) {
    console.error('Auth Callback: Unexpected error:', error)
    // Return to login on any error
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 