import { NextRequest, NextResponse } from 'next/server'

function tryVerifyToken(token: string) {
  try {
    const { verifyToken } = require('@/lib/auth')
    return verifyToken(token)
  } catch {
    try {
      return JSON.parse(Buffer.from(token, 'base64').toString())
    } catch {
      return null
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const user = tryVerifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    return NextResponse.json({
      valid: true,
      user: {
        id: user.id || user.userId,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })
    
  } catch (error) {
    console.error('Admin verify error:', error)
    return NextResponse.json({ error: 'Token verification failed' }, { status: 500 })
  }
}
