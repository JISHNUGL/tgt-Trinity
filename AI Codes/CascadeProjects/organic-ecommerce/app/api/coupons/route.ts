import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = verifyToken(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await getConnection()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    const offset = (page - 1) * limit
    
    // Build query conditions
    let whereConditions = []
    let queryParams = []
    
    if (status === 'active') {
      whereConditions.push('c.is_active = TRUE')
    } else if (status === 'inactive') {
      whereConditions.push('c.is_active = FALSE')
    } else if (status === 'expired') {
      whereConditions.push('c.expires_at < NOW()')
    }
    
    if (search) {
      whereConditions.push('(c.code LIKE ? OR c.description LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`)
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : ''
    
    // Get coupons with usage statistics
    const [coupons] = await connection.execute(`
      SELECT 
        c.*,
        cu.total_usage,
        cu.total_discount_given,
        cu.last_used,
        CASE 
          WHEN c.expires_at < NOW() THEN 'expired'
          WHEN c.is_active = FALSE THEN 'inactive'
          WHEN c.usage_limit IS NOT NULL AND c.usage_count >= c.usage_limit THEN 'exhausted'
          ELSE 'active'
        END as current_status
      FROM coupons c
      LEFT JOIN (
        SELECT 
          coupon_id,
          COUNT(*) as total_usage,
          SUM(discount_amount) as total_discount_given,
          MAX(used_at) as last_used
        FROM coupon_usage
        GROUP BY coupon_id
      ) cu ON c.id = cu.coupon_id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset])
    
    // Get total count
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM coupons c
      ${whereClause}
    `, queryParams)
    
    const total = (countResult as any)[0].total
    
    await connection.end()
    
    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get coupons error:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = verifyToken(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      code,
      description,
      discount_type,
      discount_value,
      minimum_amount = 0,
      maximum_discount,
      usage_limit,
      starts_at,
      expires_at,
      is_active = true
    } = await request.json()

    // Validation
    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ 
        error: 'Code, discount type, and discount value are required' 
      }, { status: 400 })
    }

    if (discount_type === 'percentage' && (discount_value < 0 || discount_value > 100)) {
      return NextResponse.json({ 
        error: 'Percentage discount must be between 0 and 100' 
      }, { status: 400 })
    }

    if (discount_type === 'fixed_amount' && discount_value < 0) {
      return NextResponse.json({ 
        error: 'Fixed amount discount must be positive' 
      }, { status: 400 })
    }

    if (discount_type === 'free_shipping') {
      return NextResponse.json({ 
        error: 'Free shipping coupons are not yet supported' 
      }, { status: 400 })
    }

    const connection = await getConnection()
    
    // Check if coupon code already exists
    const [existingCoupons] = await connection.execute(
      'SELECT id FROM coupons WHERE code = ?',
      [code.toUpperCase()]
    )
    
    if ((existingCoupons as any[]).length > 0) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Coupon code already exists' 
      }, { status: 400 })
    }
    
    // Create coupon
    const [result] = await connection.execute(`
      INSERT INTO coupons (
        code, description, discount_type, discount_value, minimum_amount,
        maximum_discount, usage_limit, starts_at, expires_at, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code.toUpperCase(),
      description,
      discount_type,
      discount_value,
      minimum_amount,
      maximum_discount,
      usage_limit,
      starts_at,
      expires_at,
      is_active,
      user.id || user.userId
    ])
    
    await connection.end()
    
    return NextResponse.json({
      message: 'Coupon created successfully',
      couponId: (result as any).insertId
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create coupon error:', error)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
