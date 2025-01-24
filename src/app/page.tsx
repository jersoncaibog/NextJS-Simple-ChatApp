'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Chat App</h1>
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
        <div className="mt-8">
          <p className="text-gray-600">Welcome to your chat dashboard!</p>
          {/* Add your chat interface components here */}
        </div>
      </div>
    </div>
  )
}
