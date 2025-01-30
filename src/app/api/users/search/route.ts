import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return new NextResponse(
        JSON.stringify({ error: 'Email parameter is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verify the user is authenticated
    const { data: { session } } = await supabase.auth.getSession()

    console.log('Session:', session)

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Don't allow searching for your own email
    if (session.user.email === email) {
      return new NextResponse(
        JSON.stringify({ error: 'Cannot search for your own email' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Search for user in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return new NextResponse(
          JSON.stringify({ error: `This email is not registered to PotatoChat` }),
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      console.error('Database error:', profileError)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to search for user' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new NextResponse(
      JSON.stringify({
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || 'Anonymous User',
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 