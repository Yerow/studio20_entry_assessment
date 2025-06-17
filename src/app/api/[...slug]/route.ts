import { NextRequest } from 'next/server'

// Pour l'instant, on va créer un handler simple qui redirige vers ton système existant
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  const { slug } = resolvedParams
  
  // Si c'est une requête pour users, utilise ton API existante
  if (slug[0] === 'users') {
    return new Response(JSON.stringify({ message: 'Users API - use your existing auth system' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Si c'est une requête pour posts, utilise ton API existante
  if (slug[0] === 'posts') {
    return new Response(JSON.stringify({ message: 'Posts API - use your existing system' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ message: 'PayloadCMS API placeholder' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return GET(request, { params })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return GET(request, { params })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return GET(request, { params })
}