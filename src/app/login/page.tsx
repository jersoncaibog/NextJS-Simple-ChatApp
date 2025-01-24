import { LoginButton } from '@/components/auth/LoginButton'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Chat Application',
  description: 'Login to access the chat application',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to start chatting
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <LoginButton />
        </div>
      </div>
    </div>
  )
} 