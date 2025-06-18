'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface PayloadUser {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'author' | 'user'
}

export default function Navbar() {
  const [user, setUser] = useState<PayloadUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Vérifier l'auth au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        // PayloadCMS retourne { user: {...}, token: '...' }
        const actualUser = userData.user || userData
        
        if (actualUser && actualUser.id) {
          setUser(actualUser)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      setIsMenuOpen(false)
      window.location.href = '/'
    } catch {
      console.error('Logout error')
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
              Blog 20
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Home
            </Link>
            
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : user ? (
              <>
                {/* Liens pour utilisateurs connectés */}
                <Link
                  href="/posts/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-1"
                >
                  <span>✍️</span>
                  <span>Write</span>
                </Link>
                
                {/* Lien admin SEULEMENT pour les admins/auteurs */}
                {(user.role === 'admin' || user.role === 'author') && (
                  <Link
                    href="/admin"
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center space-x-1"
                  >
                    <span>⚙️</span>
                    <span>Admin</span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">
                        <span className="font-medium">{user.name || user.email || 'User'}</span>
                      </span>
                      <div className="text-xs text-gray-500">
                        {user.role === 'admin' && '👑 Admin'}
                        {user.role === 'author' && '✍️ Author'}
                        {user.role === 'user' && '👤 Member'}
                        {!user.role && '👤 Member'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              /* Liens pour visiteurs NON CONNECTÉS */
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
                {/* Admin visible pour tous */}
                <Link
                  href="/admin"
                  className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                >
                  Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/posts/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ✍️ Write Post
                  </Link>
                  
                  {(user.role === 'admin' || user.role === 'author') && (
                    <Link
                      href="/admin"
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  
                  <div className="text-gray-600 p-2 bg-gray-50 rounded">
                    <div className="font-medium">{user.name || user.email || 'User'}</div>
                    <div className="text-sm text-gray-500">
                      {user.role === 'admin' && '👑 Admin'}
                      {user.role === 'author' && '✍️ Author'} 
                      {user.role === 'user' && '👤 Member'}
                      {!user.role && '👤 Member'}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/admin"
                    className="text-gray-500 hover:text-gray-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}