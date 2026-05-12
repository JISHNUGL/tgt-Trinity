import { NextRequest, NextResponse } from 'next/server'
import { mockOrders } from '@/lib/mockData'

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

function tryVerifyToken(token: string) {
  try {
    const { verifyToken } = require('@/lib/auth')
    return verifyToken(token)
  } catch {
    // Return mock user if auth fails
    return { userId: 1, email: 'demo@example.com', role: 'customer' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = tryVerifyToken(token)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let whereClause = decoded.role === 'admin' ? '' : 'WHERE o.user_id = ?'
    let params: any[] = decoded.role === 'admin' ? [] : [decoded.userId]

    const ordersQuery = `
      SELECT o.*, u.first_name, u.last_name, u.email,
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `
    const dbParams = [...params, limit, offset]
    const dbOrders = await tryDbQuery(ordersQuery, dbParams)

    if (dbOrders !== null) {
      const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`
      const countParams = decoded.role === 'admin' ? [] : [decoded.userId]
      const countResult = await tryDbQuery(countQuery, countParams)
      const total = (countResult as any[])?.[0]?.total || 0

      return NextResponse.json({
        orders: dbOrders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      })
    }

    // Fallback to mock data
    const orders = mockOrders.slice(offset, offset + limit)
    return NextResponse.json({
      orders,
      pagination: { page, limit, total: mockOrders.length, pages: Math.ceil(mockOrders.length / limit) }
    })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = tryVerifyToken(token)
    const body = await request.json()
    const { items, shippingAddress, billingAddress, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      )
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)

    const result = await tryDbQuery(
      `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, billing_address, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [decoded.userId, orderNumber, totalAmount, shippingAddress, billingAddress || shippingAddress, notes]
    )

    if (result) {
      const orderId = (result as any).insertId

      for (const item of items) {
        await tryDbQuery(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice]
        )

        await tryDbQuery(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.productId]
        )
      }

      return NextResponse.json({
        message: 'Order created successfully',
        order: { id: orderId, orderNumber, totalAmount, status: 'pending' }
      })
    }

    // Mock fallback: simulate order creation
    const mockOrderId = Date.now()
    return NextResponse.json({
      message: 'Order created successfully (demo mode)',
      order: { id: mockOrderId, orderNumber, totalAmount, status: 'pending' }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
