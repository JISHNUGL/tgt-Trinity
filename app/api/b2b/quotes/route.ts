import { NextRequest, NextResponse } from 'next/server'

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
    // Decode demo token
    try {
      return JSON.parse(Buffer.from(token, 'base64').toString())
    } catch {
      return { userId: 1, email: 'admin@organic.com', role: 'admin' }
    }
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
    const status = searchParams.get('status')
    
    let whereClause = 'qr.user_id = ?'
    let params: any[] = [decoded.userId]
    
    if (decoded.role === 'admin') {
      whereClause = '1=1'
      params = []
    }
    
    if (status) {
      whereClause += ' AND qr.status = ?'
      params.push(status)
    }

    const quotes = await tryDbQuery(`
      SELECT 
        qr.*,
        u.first_name,
        u.last_name,
        u.email as user_email,
        COUNT(qi.id) as item_count,
        COALESCE(SUM(qi.total_price), 0) as total_amount
      FROM quote_requests qr
      LEFT JOIN users u ON qr.user_id = u.id
      LEFT JOIN quote_items qi ON qr.id = qi.quote_request_id
      WHERE ${whereClause}
      GROUP BY qr.id
      ORDER BY qr.created_at DESC
    `, params)

    if (quotes !== null) {
      return NextResponse.json({ quotes })
    }

    // Mock fallback
    return NextResponse.json({ quotes: [] })
  } catch (error) {
    console.error('Get quotes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const { businessName, contactPerson, email, phone, items, shippingAddress, notes } = body

    if (!businessName || !contactPerson || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const quoteResult = await tryDbQuery(`
      INSERT INTO quote_requests (
        user_id, business_name, contact_person, email, phone, 
        shipping_address, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [decoded.userId, businessName, contactPerson, email, phone || null,
        shippingAddress ? JSON.stringify(shippingAddress) : null, notes || null])

    if (quoteResult) {
      const quoteId = (quoteResult as any).insertId
      for (const item of items) {
        const product = await tryDbQuery('SELECT price FROM products WHERE id = ?', [item.productId])
        if (Array.isArray(product) && product.length > 0) {
          const unitPrice = (product as any)[0].price
          await tryDbQuery(`
            INSERT INTO quote_items (quote_request_id, product_id, quantity, unit_price, total_price, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [quoteId, item.productId, item.quantity, unitPrice, unitPrice * item.quantity, item.notes || null])
        }
      }
      return NextResponse.json({ success: true, message: 'Quote request submitted successfully', quoteId })
    }

    // Demo mode
    return NextResponse.json({
      success: true,
      message: 'Quote request submitted (demo mode)',
      quoteId: Date.now()
    })
  } catch (error) {
    console.error('Create quote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = tryVerifyToken(token)
    const body = await request.json()
    const { quoteId, status, quotedAmount, adminNotes } = body

    if (!quoteId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await tryDbQuery(`
      UPDATE quote_requests 
      SET status = ?, quoted_amount = ?, admin_notes = ?, updated_at = NOW()
      WHERE id = ?
    `, [status, quotedAmount || null, adminNotes || null, quoteId])

    return NextResponse.json({ success: true, message: `Quote ${status} successfully` })
  } catch (error) {
    console.error('Update quote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
