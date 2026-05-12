import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    
    if (decoded.role !== 'b2b' || !decoded.b2bApproved) {
      return NextResponse.json({ error: 'B2B access required' }, { status: 403 })
    }

    const repeatedOrders = await query(`
      SELECT 
        ro.*,
        o.order_number as original_order_number,
        o.created_at as original_order_date
      FROM repeated_orders ro
      LEFT JOIN orders o ON ro.original_order_id = o.id
      WHERE ro.user_id = ? AND ro.is_active = TRUE
      ORDER BY ro.last_ordered DESC, ro.created_at DESC
    `, [decoded.userId])

    return NextResponse.json({ repeatedOrders })
  } catch (error) {
    console.error('Get repeated orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    
    if (decoded.role !== 'b2b' || !decoded.b2bApproved) {
      return NextResponse.json({ error: 'B2B access required' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, orderName } = body

    if (!orderId || !orderName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get original order details
    const originalOrder = await query(`
      SELECT 
        o.id,
        o.total_amount,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ? AND o.user_id = ? AND o.status = 'completed'
      GROUP BY o.id, o.total_amount
    `, [orderId, decoded.userId])

    if (!Array.isArray(originalOrder) || originalOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found or not completed' }, { status: 404 })
    }

    const order = originalOrder[0] as any

    // Check if reorder already exists
    const existingReorder = await query(`
      SELECT id FROM repeated_orders 
      WHERE user_id = ? AND original_order_id = ? AND order_name = ?
    `, [decoded.userId, orderId, orderName])

    if (Array.isArray(existingReorder) && existingReorder.length > 0) {
      return NextResponse.json({ error: 'Reorder with this name already exists' }, { status: 400 })
    }

    // Create repeated order
    const result = await query(`
      INSERT INTO repeated_orders (
        user_id, original_order_id, order_name, items, total_amount
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      decoded.userId,
      orderId,
      orderName,
      order.items,
      order.total_amount
    ])

    return NextResponse.json({
      success: true,
      message: 'Reorder template created successfully',
      reorderId: (result as any).insertId
    })
  } catch (error) {
    console.error('Create reorder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    
    if (decoded.role !== 'b2b' || !decoded.b2bApproved) {
      return NextResponse.json({ error: 'B2B access required' }, { status: 403 })
    }

    const body = await request.json()
    const { reorderId, orderName } = body

    if (!reorderId || !orderName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update reorder name
    await query(`
      UPDATE repeated_orders 
      SET order_name = ?, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [orderName, reorderId, decoded.userId])

    return NextResponse.json({
      success: true,
      message: 'Reorder updated successfully'
    })
  } catch (error) {
    console.error('Update reorder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    
    if (decoded.role !== 'b2b' || !decoded.b2bApproved) {
      return NextResponse.json({ error: 'B2B access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reorderId = searchParams.get('reorderId')

    if (!reorderId) {
      return NextResponse.json({ error: 'Reorder ID required' }, { status: 400 })
    }

    // Deactivate reorder (soft delete)
    await query(`
      UPDATE repeated_orders 
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [reorderId, decoded.userId])

    return NextResponse.json({
      success: true,
      message: 'Reorder deleted successfully'
    })
  } catch (error) {
    console.error('Delete reorder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
