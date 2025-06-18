'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface PayloadUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'author' | 'user'
}

export default function CreatePost() {
  const [user, setUser] = useState<PayloadUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Vérifier l'authentification
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
        setUser(userData)
      } else {
        // Pas connecté, rediriger vers signin
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth/signin')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation côté client
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      setLoading(false)
      return
    }

    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters long')
      setLoading(false)
      return
    }

    if (formData.content.trim().length < 10) {
      setError('Content must be at least 10 characters long')
      setLoading(false)
      return
    }

    try {
      // Créer le post via l'API PayloadCMS
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour l'auth PayloadCMS
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim() || undefined,
          status: 'published', // Publier directement (ou 'draft' selon tes besoins)
          author: user?.id, // Assigner l'auteur
          publishedAt: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Succès ! Rediriger vers la homepage ou le post créé
        if (data.doc && data.doc.id) {
          router.push(`/posts/${data.doc.id}`)
        } else {
          router.push('/')
        }
      } else {
        setError(data.errors?.[0]?.message || data.message || 'Failed to create post')
      }
    } catch (error) {
      console.error('Create post error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Afficher loader pendant vérification auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  // Ne pas afficher si pas authentifié (redirection en cours)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Post
          </h1>
          <p className="text-gray-600">
            Share your thoughts with the Blog 20 community, {user.name}!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Enter your post title..."
                value={formData.title}
                onChange={handleInputChange}
                maxLength={100}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Excerpt Field */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt (Optional)
              </label>
              <input
                type="text"
                id="excerpt"
                name="excerpt"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your post..."
                value={formData.excerpt}
                onChange={handleInputChange}
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.excerpt.length}/200 characters • If left empty, we will auto-generate from your content
              </p>
            </div>

            {/* Content Field */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="Write your blog post content here...

You can use simple formatting:

**Bold text**
*Italic text*

- Bullet points
- Another point

Or just write in plain text!"
                value={formData.content}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.content.length} characters • Minimum 10 characters required
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Cancel
              </Link>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ title: '', content: '', excerpt: '' })
                    setError('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.title.trim() || !formData.content.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    'Publish Post'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            ✨ Publishing with PayloadCMS
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Your post will be published immediately and visible to all visitors</p>
            <p>• You can edit or delete your posts anytime</p>
            <p>• Admins can access advanced editing features in the <Link href="/admin" className="underline">admin panel</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}