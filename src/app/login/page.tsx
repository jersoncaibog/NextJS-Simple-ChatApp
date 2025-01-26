import { LoginButton } from '@/components/auth/LoginButton'
import { Metadata } from 'next'
import Image from 'next/image'
import logo from '/public/images/potatochat.svg'

export const metadata: Metadata = {
  title: 'Login - PotatoChat',
  description: 'Login to access the chat application',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image 
              src={logo}
              alt="PotatoChat Logo" 
              width={28}
              height={28}
              priority
            />
            <h1 className="text-xl font-bold text-gray-900">
              PotatoChat
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-16 pb-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to start chatting
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <LoginButton />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} JDC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 