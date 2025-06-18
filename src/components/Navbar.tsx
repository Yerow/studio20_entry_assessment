// src/components/Navbar.tsx - Version Vercel Fix
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        cache: 'no-store'
      })
      
      if (response.ok) {
        const userData = await response.json()
        const actualUser = userData.user || userData
        
        if (actualUser && actualUser.id) {
          setUser(actualUser)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    setIsMenuOpen(false)

    try {
      // 1. Utiliser notre API custom de logout (plus fiable sur Vercel)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      // 2. Nettoyer l'état côté client immédiatement
      setUser(null)
      
      // 3. Nettoyer TOUS les cookies PayloadCMS
      const cookiesToClear = [
        'payload-token',
        'payload_token', 
        'payload-refresh-token',
        'payload_refresh_token',
        'connect.sid',
        'session',
        'auth',
        '__Secure-payload-token',
        '__Host-payload-token'
      ]

      cookiesToClear.forEach(cookieName => {
        // Supprimer pour le domaine actuel
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
        
        // Supprimer pour le domaine parent (Vercel)
        if (window.location.hostname.includes('vercel.app')) {
          const domain = window.location.hostname.split('.').slice(-2).join('.')
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`
        }
      })

      // 4. Forcer le refresh de Next.js
      router.refresh()
      
      // 5. Redirection avec delay pour laisser le temps au nettoyage
      setTimeout(() => {
        window.location.href = window.location.origin
      }, 500)

      console.log('Logout successful')

    } catch (error) {
      console.error('Logout error:', error)
      
      // Même en cas d'erreur, nettoyer côté client
      setUser(null)
      
      // Forcer la redirection
      setTimeout(() => {
        window.location.href = window.location.origin
      }, 100)
    } finally {
      setIsLoggingOut(false)
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
                <Link
                  href="/posts/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-1"
                >
                  <span>✍️</span>
                  <span>Write</span>
                </Link>
                
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
                    disabled={isLoggingOut}
                    className="text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <span>Sign Out</span>
                    )}
                  </button>
                </div>
              </>
            ) : (
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
                    disabled={isLoggingOut}
                    className="text-gray-600 hover:text-gray-800 transition-colors text-left disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
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