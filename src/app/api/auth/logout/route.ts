// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Custom logout API called')

    // 1. Essayer le logout PayloadCMS standard
    try {
      const payloadLogoutResponse = await fetch(`${request.nextUrl.origin}/api/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        credentials: 'include'
      })
      
      console.log('📤 PayloadCMS logout response:', payloadLogoutResponse.status)
    } catch (error) {
      console.log('⚠️ PayloadCMS logout failed:', error)
      // Continue même si PayloadCMS échoue
    }

    // 2. Créer la réponse avec nettoyage complet des cookies
    const response = NextResponse.json(
      { 
        message: 'Logout successful',
        success: true,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )

    // 3. Supprimer TOUS les cookies potentiels PayloadCMS
    const cookiesToClear = [
      'payload-token',
      'payload_token', 
      'payload-refresh-token',
      'payload_refresh_token',
      'connect.sid',
      'session',
      'auth',
      '__Secure-payload-token',
      '__Host-payload-token',
      'next-auth.session-token',
      'next-auth.csrf-token'
    ]

    // Configuration de suppression des cookies pour Vercel
    const cookieOptions = [
      'Path=/',
      'Max-Age=0',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'HttpOnly',
      'Secure',
      'SameSite=Lax'
    ]

    cookiesToClear.forEach(cookieName => {
      // Configuration standard
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      })

      // Configuration manuelle pour être sûr (Vercel specific)
      response.headers.append('Set-Cookie', `${cookieName}=; ${cookieOptions.join('; ')}`)
      
      // Pour les sous-domaines Vercel
      if (process.env.VERCEL_URL) {
        const domain = process.env.VERCEL_URL.split('.').slice(-2).join('.')
        response.headers.append('Set-Cookie', `${cookieName}=; ${cookieOptions.join('; ')}; Domain=.${domain}`)
      }
    })

    // 4. Headers de cache pour éviter la mise en cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    console.log('✅ Custom logout completed successfully')
    return response

  } catch (error) {
    console.error('❌ Custom logout error:', error)
    
    // Même en cas d'erreur, retourner une réponse de succès
    // avec nettoyage des cookies
    const errorResponse = NextResponse.json(
      { 
        message: 'Logout completed with cleanup',
        success: true,
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 200 }
    )

    // Nettoyer les cookies même en cas d'erreur
    const cookiesToClear = ['payload-token', 'payload_token', 'session']
    cookiesToClear.forEach(cookieName => {
      errorResponse.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      })
    })

    return errorResponse
  }
}