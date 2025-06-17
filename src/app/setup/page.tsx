'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const createAdmin = async () => {
    setLoading(true)
    setError('')

    try {
      // Utilise l'API de registration existante de ton système
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Admin User',
          email: 'admin@blog20.com',
          password: 'admin123'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      } else {
        setError(result.error || 'Failed to create admin user')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Admin User Created!
          </h1>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="font-semibold">Login Credentials:</p>
            <p>📧 Email: admin@blog20.com</p>
            <p>🔑 Password: admin123</p>
          </div>
          <p className="text-gray-600 mb-4">
            Redirecting to sign in page in 3 seconds...
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to Sign In Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Setup Admin User
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Create the first admin user for your blog application.
          </p>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              <strong>Admin credentials:</strong><br />
              Email: admin@blog20.com<br />
              Password: admin123
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={createAdmin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Admin User...
            </>
          ) : (
            'Create Admin User'
          )}
        </button>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}