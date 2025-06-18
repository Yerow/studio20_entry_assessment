'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// Interface pour les posts PayloadCMS
interface PayloadPost {
  id: string
  title: string
  content: Record<string, unknown>
  excerpt?: string
  author: {
    id: string
    name: string
    email: string
  }
  status: 'draft' | 'published'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  slug?: string
}

interface PayloadResponse {
  docs: PayloadPost[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
}

interface PayloadUser {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'author' | 'user'
}

export default function Home() {
  const [posts, setPosts] = useState<PayloadPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<PayloadUser | null>(null)

  useEffect(() => {
    fetchPosts()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/users/me', { credentials: 'include' })
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
    }
  }

  const fetchPosts = async () => {
    try {
      // Récupérer seulement les posts publiés
      const response = await fetch('/api/posts?where[status][equals]=published&sort=-publishedAt&depth=1&limit=12')
      
      if (response.ok) {
        const data: PayloadResponse = await response.json()
        setPosts(data.docs)
      } else {
        console.error('Erreur API:', response.status, response.statusText)
        setError('Failed to fetch posts')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Unknown date'
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateExcerpt = (post: PayloadPost): string => {
    if (post.excerpt) return post.excerpt
    return 'Click to read more...'
  }

  // Vérifier si l'utilisateur est admin ou auteur
  const isAdminOrAuthor = user && (user.role === 'admin' || user.role === 'author')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Blog 20
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover amazing stories, insights, and ideas from our community of writers.
          </p>
          {!user ? (
            <Link
              href="/auth/signup"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg space-x-2"
            >
              <span>✍️</span>
              <span>Join the Community</span>
            </Link>
          ) : (
            <Link
              href="/posts/create"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg space-x-2"
            >
              <span>✍️</span>
              <span>Write Your Story</span>
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
              {error}
              <br />
              {isAdminOrAuthor && (
                <small className="text-red-600">
                  Make sure PayloadCMS is running on <Link href="/admin" className="underline">/admin</Link>
                </small>
              )}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {!loading && !error && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Latest Posts
              </h2>
              {posts.length > 0 && (
                <p className="text-gray-600">
                  {posts.length} {posts.length === 1 ? 'article' : 'articles'} published
                </p>
              )}
            </div>

            {/* Posts Grid */}
            {posts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block group"
                  >
                    <article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full border border-gray-100">
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {generateExcerpt(post)}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {post.author?.name?.charAt(0)?.toUpperCase() || post.author?.email?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="font-medium text-gray-700">
                              {post.author?.name || post.author?.email || 'Unknown Author'}
                            </span>
                          </div>
                          <time dateTime={post.publishedAt || post.createdAt}>
                            {formatDate(post.publishedAt || post.createdAt)}
                          </time>
                        </div>
                        <div className="mt-3 text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                          Read article →
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No posts published yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to share your thoughts and start the conversation!
                  </p>
                  {user ? (
                    <Link
                      href="/posts/create"
                      className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium space-x-2"
                    >
                      <span>✍️</span>
                      <span>Write the First Post</span>
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium space-x-2"
                    >
                      <span>✍️</span>
                      <span>Join & Write the First Post</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Admin Link - Visible uniquement pour les admins/auteurs */}
            {isAdminOrAuthor && (
              <div className="mt-12 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    ✍️ Content Management
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Access the powerful admin interface to create, edit, and manage your blog posts.
                  </p>
                  <Link
                    href="/admin"
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium space-x-2"
                  >
                    <span>🚀</span>
                    <span>Go to Admin Panel</span>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}