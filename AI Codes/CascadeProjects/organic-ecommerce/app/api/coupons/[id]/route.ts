import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = verifyToken(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await getConnection()
    
    // Get coupon with usage statistics
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
        END as current_status,
        u.first_name as created_by_name,
        u.email as created_by_email
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
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [params.id])
    
    if ((coupons as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    
    // Get recent usage
    const [usageHistory] = await connection.execute(`
      SELECT 
        cu.*,
        o.total_amount as order_total,
        u.email as customer_email
      FROM coupon_usage cu
      INNER JOIN orders o ON cu.order_id = o.id
      INNER JOIN users u ON cu.user_id = u.id
      WHERE cu.coupon_id = ?
      ORDER BY cu.used_at DESC
      LIMIT 10
    `, [params.id])
    
    await connection.end()
    
    return NextResponse.json({
      coupon: (coupons as any)[0],
      usageHistory
    })
  } catch (error) {
    console.error('Get coupon error:', error)
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      minimum_amount,
      maximum_discount,
      usage_limit,
      starts_at,
      expires_at,
      is_active
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

    const connection = await getConnection()
    
    // Check if coupon exists
    const [existingCoupons] = await connection.execute(
      'SELECT id FROM coupons WHERE id = ?',
      [params.id]
    )
    
    if ((existingCoupons as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    
    // Check if new code conflicts with existing coupon (excluding current one)
    if (code) {
      const [conflictingCoupons] = await connection.execute(
        'SELECT id FROM coupons WHERE code = ? AND id != ?',
        [code.toUpperCase(), params.id]
      )
      
      if ((conflictingCoupons as any[]).length > 0) {
        await connection.end()
        return NextResponse.json({ 
          error: 'Coupon code already exists' 
        }, { status: 400 })
      }
    }
    
    // Update coupon
    await connection.execute(`
      UPDATE coupons SET
        code = ?,
        description = ?,
        discount_type = ?,
        discount_value = ?,
        minimum_amount = ?,
        maximum_discount = ?,
        usage_limit = ?,
        starts_at = ?,
        expires_at = ?,
        is_active = ?
      WHERE id = ?
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
      params.id
    ])
    
    await connection.end()
    
    return NextResponse.json({
      message: 'Coupon updated successfully'
    })
    
  } catch (error) {
    console.error('Update coupon error:', error)
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = verifyToken(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await getConnection()
    
    // Check if coupon exists
    const [existingCoupons] = await connection.execute(
      'SELECT id, usage_count FROM coupons WHERE id = ?',
      [params.id]
    )
    
    if ((existingCoupons as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    
    const coupon = (existingCoupons as any)[0]
    
    // Prevent deletion if coupon has been used
    if (coupon.usage_count > 0) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Cannot delete coupon that has been used. Consider deactivating it instead.' 
      }, { status: 400 })
    }
    
    // Delete coupon
    await connection.execute('DELETE FROM coupons WHERE id = ?', [params.id])
    
    await connection.end()
    
    return NextResponse.json({
      message: 'Coupon deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete coupon error:', error)
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
