'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

interface PayloadUser {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'author' | 'user'
}

export default function PostDetail() {
  const params = useParams()
  const [post, setPost] = useState<PayloadPost | null>(null)
  const [user, setUser] = useState<PayloadUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getParams = async () => {
      if (params.id) {
        await fetchPost(params.id as string)
      }
    }
    getParams()
    checkAuth()
  }, [params.id])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/users/me', { credentials: 'include' })
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
    } catch {
      setUser(null)
    }
  }

  const fetchPost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}?depth=1`)
      
      if (response.ok) {
        const data: PayloadPost = await response.json()
        
        // Vérifier si le post est publié
        if (data.status !== 'published') {
          setError('Post not published')
        } else {
          setPost(data)
        }
      } else if (response.status === 404) {
        setError('Post not found')
      } else {
        setError('Failed to load post')
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Vérifier si l'utilisateur est admin ou auteur
  const isAdminOrAuthor = user && (user.role === 'admin' || user.role === 'author')

  // Fonction pour extraire et afficher le Markdown depuis Lexical
  const renderContent = (content: Record<string, unknown>) => {
    let markdownText = ''
    
    if (typeof content === 'string') {
      // Si c'est du texte simple, on l'utilise tel quel
      markdownText = content
    } else if (content && content.root && typeof content.root === 'object') {
      const root = content.root as { children?: unknown[] }
      
      if (root.children) {
        // Extraire le markdown du format Lexical
        const extractMarkdown = (nodes: unknown[]): string => {
          return nodes.map(node => {
            if (node && typeof node === 'object') {
              const nodeObj = node as { type?: string; text?: string; children?: unknown[] }
              if (nodeObj.type === 'text' && nodeObj.text) {
                return nodeObj.text
              }
              if (nodeObj.children) {
                return extractMarkdown(nodeObj.children)
              }
            }
            return ''
          }).join('')
        }
        
        markdownText = extractMarkdown(root.children)
      }
    }
    
    // Si on a du contenu, l'afficher en Markdown
    if (markdownText.trim()) {
      return (
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownText}
          </ReactMarkdown>
        </div>
      )
    }
    
    // Fallback si pas de contenu
    return (
      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {post?.excerpt || 'No content available.'}
        </p>
        {isAdminOrAuthor && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              📝 This post was created with PayloadCMS. 
              <Link 
                href={`/admin/collections/posts/${post?.id}`}
                className="font-medium underline hover:no-underline ml-1"
              >
                Edit in admin panel →
              </Link>
            </p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'Post not found' ? 'Post not found' : 
               error === 'Post not published' ? 'Post not available' :
               'Something went wrong'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error === 'Post not found' 
                ? 'The post you\'re looking for doesn\'t exist or has been removed.'
                : error === 'Post not published'
                ? 'This post is not yet published or has been moved to drafts.'
                : 'We couldn\'t load this post. Please try again later.'
              }
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>
        </div>

        {/* Post content */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>
              <span className="ml-4 text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                Published
              </span>
            </div>
            
            {/* Author and date info */}
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {post.author.name?.charAt(0)?.toUpperCase() || post.author.email?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.author.name || post.author.email}</p>
                  <p className="text-sm text-gray-500">{post.author.email}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <time dateTime={post.publishedAt || post.createdAt}>
                  Published {formatDate(post.publishedAt || post.createdAt)}
                </time>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 italic text-lg leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="prose max-w-none">
              {renderContent(post.content)}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {post.createdAt !== post.updatedAt && (
                  <span>
                    Last updated {formatDate(post.updatedAt)}
                  </span>
                )}
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                >
                  ← More posts
                </Link>
                {isAdminOrAuthor ? (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                  >
                    ⚙️ Manage posts
                  </Link>
                ) : (
                  <Link
                    href="/posts/create"
                    className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                  >
                    ✍️ Write your own
                  </Link>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}