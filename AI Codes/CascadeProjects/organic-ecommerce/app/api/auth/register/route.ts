import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import Joi from 'joi'

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('customer', 'b2b').default('customer'),
  businessName: Joi.string().when('role', {
    is: 'b2b',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  businessAddress: Joi.string().when('role', {
    is: 'b2b',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  taxId: Joi.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { error, value } = registerSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, phone, role, businessName, businessAddress, taxId } = value

    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    const result: any = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, business_name, business_address, tax_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, phone, role, businessName, businessAddress, taxId]
    )

    if (role === 'b2b') {
      await query(
        `INSERT INTO b2b_applications (user_id, business_name, business_address, tax_id, contact_person, contact_email, contact_phone) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [result.insertId, businessName, businessAddress, taxId, `${firstName} ${lastName}`, email, phone]
      )
    }

    const token = generateToken({
      userId: result.insertId,
      email,
      role,
      b2bApproved: role === 'b2b' ? false : undefined
    })

    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        role,
        b2bApproved: role === 'b2b' ? false : undefined
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
