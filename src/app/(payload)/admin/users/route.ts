import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const users = client.db('blog20').collection('users')
    
    // Récupère tous les utilisateurs sans les mots de passe
    const allUsers = await users
      .find(
        {},
        { 
          projection: { 
            password: 0 // Exclut le mot de passe
          }
        }
      )
      .sort({ createdAt: -1 })
      .toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedUsers = allUsers.map(user => ({
      ...user,
      _id: user._id.toString()
    }))

    return NextResponse.json(serializedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}