'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { adminLogin } from '../actions'

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
    >
      {pending ? 'Logging in...' : 'Log In'}
    </button>
  )
}

export default function AdminLoginPage() {
  const [state, action] = useActionState(adminLogin, { error: '' })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Title 24 Directory</p>
        </div>
        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-lg"
              placeholder="Enter admin password"
            />
          </div>
          {state.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}
          <LoginButton />
        </form>
      </div>
    </div>
  )
}
