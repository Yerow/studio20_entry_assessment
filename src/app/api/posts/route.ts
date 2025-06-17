import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET all posts
export async function GET() {
  try {
    const client = await clientPromise
    const posts = client.db('blog20').collection('posts')
    
    const allPosts = await posts
      .find({ published: true })
      .sort({ createdAt: -1 })
      .toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedPosts = allPosts.map(post => ({
      ...post,
      _id: post._id.toString()
    }))

    return NextResponse.json(serializedPosts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST new post (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to create a post' },
        { status: 401 }
      )
    }

    const { title, content, excerpt } = await request.json()

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    if (title.length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters long' },
        { status: 400 }
      )
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters long' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const posts = client.db('blog20').collection('posts')
    const users = client.db('blog20').collection('users')

    // Get user details
    const user = await users.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate excerpt if not provided
    const postExcerpt = excerpt || content.substring(0, 150).trim() + (content.length > 150 ? '...' : '')

    const newPost = {
      title: title.trim(),
      content: content.trim(),
      excerpt: postExcerpt,
      author: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      },
      published: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await posts.insertOne(newPost)

    return NextResponse.json(
      { 
        message: 'Post created successfully', 
        postId: result.insertedId.toString(),
        post: {
          ...newPost,
          _id: result.insertedId.toString()
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post. Please try again.' },
      { status: 500 }
    )
  }
}