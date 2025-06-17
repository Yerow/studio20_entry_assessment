'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function CreatePost() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side validation
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
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim() || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success! Redirect to home page
        router.push('/')
      } else {
        setError(data.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Create post error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
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
            Share your thoughts with the Blog 20 community
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

            {/* Content Field with Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content * (Markdown supported)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className={`px-3 py-1 text-sm rounded ${
                      !showPreview 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={`px-3 py-1 text-sm rounded ${
                      showPreview 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>
              
              {!showPreview ? (
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical font-mono text-sm"
                  placeholder="Write your blog post content here using Markdown...

# This is a heading
## This is a subheading

**Bold text** and *italic text*

- Bullet point
- Another bullet point

```javascript
// Code blocks are supported too!
console.log('Hello world');
```

[Link to somewhere](https://example.com)"
                  value={formData.content}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  {formData.content ? (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formData.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Preview will appear here when you start writing...</p>
                  )}
                </div>
              )}
              
              <p className="mt-1 text-sm text-gray-500">
                {formData.content.length} characters • Minimum 10 characters required • 
                <a 
                  href="https://www.markdownguide.org/basic-syntax/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-700 ml-1"
                >
                  Markdown guide
                </a>
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

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">✍️ Writing Tips & Markdown</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Writing Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Start with an engaging title</li>
                <li>• Write in a conversational tone</li>
                <li>• Use headings to organize content</li>
                <li>• Share personal experiences</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Markdown Examples:</h4>
              <ul className="text-sm text-blue-700 space-y-1 font-mono">
                <li>• # Heading or ## Subheading</li>
                <li>• **bold** and *italic*</li>
                <li>• `code` and ```code blocks```</li>
                <li>• [links](url) and lists with -</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}