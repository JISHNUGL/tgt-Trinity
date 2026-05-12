import { NextRequest, NextResponse } from 'next/server'
import Joi from 'joi'

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// Demo accounts for when database is unavailable
const demoAccounts: Record<string, { password: string; user: any }> = {
  'admin@organic.com': {
    password: 'admin123',
    user: {
      id: 1,
      email: 'admin@organic.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      b2bApproved: undefined
    }
  },
  'customer@organic.com': {
    password: 'customer123',
    user: {
      id: 2,
      email: 'customer@organic.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
      b2bApproved: undefined
    }
  },
  'b2b@organic.com': {
    password: 'b2b123',
    user: {
      id: 3,
      email: 'b2b@organic.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'b2b',
      b2bApproved: true
    }
  }
}

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
    const body = await request.json()
    
    const { error, value } = loginSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      )
    }

    const { email, password } = value

    // Try database first
    const users = await tryDbQuery(
      'SELECT id, email, password_hash, first_name, last_name, role, b2b_approved FROM users WHERE email = ?',
      [email]
    )

    if (users !== null) {
      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const user = users[0] as any

      try {
        const { comparePassword, generateToken } = await import('@/lib/auth')
        const isValidPassword = await comparePassword(password, user.password_hash)
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          )
        }

        const token = generateToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          b2bApproved: user.b2b_approved
        })

        return NextResponse.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            b2bApproved: user.b2b_approved
          }
        })
      } catch {
        // Auth module failed, fall through to demo
      }
    }

    // Fallback: demo accounts (when MySQL is not available)
    const demoAccount = demoAccounts[email.toLowerCase()]
    if (demoAccount && demoAccount.password === password) {
      // Generate a simple demo token
      const demoToken = Buffer.from(JSON.stringify({
        userId: demoAccount.user.id,
        email: demoAccount.user.email,
        role: demoAccount.user.role,
        b2bApproved: demoAccount.user.b2bApproved,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
      })).toString('base64')

      return NextResponse.json({
        message: 'Login successful (demo mode)',
        token: demoToken,
        user: demoAccount.user
      })
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
