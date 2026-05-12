import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { couponCode, orderTotal } = await request.json()

    if (!couponCode || orderTotal === undefined) {
      return NextResponse.json({ 
        error: 'Coupon code and order total are required' 
      }, { status: 400 })
    }

    const connection = await getConnection()
    
    // Get coupon details
    const [coupons] = await connection.execute(`
      SELECT 
        c.*,
        cu.total_usage,
        cu.total_discount_given,
        cu.last_used
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
      WHERE c.code = ? AND c.is_active = TRUE
    `, [couponCode.toUpperCase()])
    
    if ((coupons as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Invalid coupon code' 
      }, { status: 400 })
    }
    
    const coupon = (coupons as any)[0]
    
    // Validate coupon
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Coupon has expired' 
      }, { status: 400 })
    }
    
    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Coupon is not yet active' 
      }, { status: 400 })
    }
    
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Coupon usage limit has been reached' 
      }, { status: 400 })
    }
    
    if (orderTotal < coupon.minimum_amount) {
      await connection.end()
      return NextResponse.json({ 
        error: `Minimum order amount of $${coupon.minimum_amount.toFixed(2)} required` 
      }, { status: 400 })
    }
    
    // Calculate discount
    let discountAmount = 0
    let discountText = ''
    
    if (coupon.discount_type === 'percentage') {
      discountAmount = orderTotal * (coupon.discount_value / 100)
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = coupon.maximum_discount
      }
      discountText = `${coupon.discount_value}% off`
    } else if (coupon.discount_type === 'fixed_amount') {
      discountAmount = coupon.discount_value
      if (discountAmount > orderTotal) {
        discountAmount = orderTotal
      }
      discountText = `$${coupon.discount_value.toFixed(2)} off`
    } else if (coupon.discount_type === 'free_shipping') {
      discountAmount = 10.00 // Fixed shipping cost
      discountText = 'Free shipping'
    }
    
    const newTotal = orderTotal - discountAmount
    
    await connection.end()
    
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountText,
        discountAmount: discountAmount.toFixed(2),
        originalTotal: orderTotal.toFixed(2),
        newTotal: newTotal.toFixed(2),
        minimumAmount: coupon.minimum_amount,
        usageLimit: coupon.usage_limit,
        usageCount: coupon.usage_count,
        expiresAt: coupon.expires_at
      }
    })
    
  } catch (error) {
    console.error('Validate coupon error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
