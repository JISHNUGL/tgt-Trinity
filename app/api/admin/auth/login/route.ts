import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

let dbAvailable: boolean | null = null

async function tryDbQuery(sql: string, params?: any[]) {
  if (dbAvailable === false) return null
  try {
    const { query } = await import('@/lib/db')
    const result = await query(sql, params)
    dbAvailable = true
    return result
  } catch {
    dbAvailable = false
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Try database first
    const users = await tryDbQuery(
      'SELECT * FROM users WHERE email = ? AND role = "admin"',
      [email]
    )

    if (users !== null && Array.isArray(users) && users.length > 0) {
      const user = users[0] as any
      try {
        const isValid = await compare(password, user.password || user.password_hash)
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }
        
        const secret = process.env.JWT_SECRET || 'fallback-secret'
        const token = sign(
          { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name },
          secret,
          { expiresIn: '24h' }
        )
        const { password: _, password_hash: __, ...userWithoutPassword } = user
        return NextResponse.json({ message: 'Login successful', token, user: userWithoutPassword })
      } catch {
        // Fall through to demo
      }
    }

    // Demo admin login
    if (email === 'admin@organic.com' && password === 'admin123') {
      const secret = process.env.JWT_SECRET || 'fallback-secret'
      const demoToken = sign(
        { userId: 1, email: 'admin@organic.com', role: 'admin' },
        secret,
        { expiresIn: '24h' }
      )

      return NextResponse.json({
        message: 'Login successful (demo mode)',
        token: demoToken,
        user: { id: 1, email: 'admin@organic.com', first_name: 'Admin', last_name: 'User', role: 'admin' }
      })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
