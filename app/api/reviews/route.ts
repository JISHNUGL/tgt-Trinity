import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating')
    const status = searchParams.get('status') // approved, pending, rejected
    const search = searchParams.get('search')
    
    const offset = (page - 1) * limit
    
    const connection = await getConnection()
    
    // Build query conditions
    let whereConditions = []
    let queryParams = []
    
    if (productId) {
      whereConditions.push('pr.product_id = ?')
      queryParams.push(productId)
    }
    
    if (rating) {
      whereConditions.push('pr.rating = ?')
      queryParams.push(rating)
    }
    
    if (status === 'approved') {
      whereConditions.push('pr.is_approved = TRUE')
    } else if (status === 'pending') {
      whereConditions.push('pr.is_approved = FALSE')
    } else if (status === 'rejected') {
      whereConditions.push('pr.is_approved = FALSE AND pr.is_rejected = TRUE')
    }
    
    if (search) {
      whereConditions.push('(pr.title LIKE ? OR pr.review LIKE ? OR u.email LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : ''
    
    // Get reviews with user and product information
    const [reviews] = await connection.execute(`
      SELECT 
        pr.*,
        u.first_name,
        u.last_name,
        u.email,
        p.name as product_name,
        p.image_url as product_image,
        o.created_at as order_date,
        CASE 
          WHEN pr.is_approved = TRUE THEN 'approved'
          WHEN pr.is_rejected = TRUE THEN 'rejected'
          ELSE 'pending'
        END as review_status
      FROM product_reviews pr
      INNER JOIN users u ON pr.user_id = u.id
      INNER JOIN products p ON pr.product_id = p.id
      INNER JOIN orders o ON pr.order_id = o.id
      ${whereClause}
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset])
    
    // Get total count
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM product_reviews pr
      ${whereClause}
    `, queryParams)
    
    const total = (countResult as any)[0].total
    
    await connection.end()
    
    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      product_id,
      order_id,
      rating,
      title,
      review
    } = await request.json()

    // Validation
    if (!product_id || !order_id || !rating) {
      return NextResponse.json({ 
        error: 'Product ID, order ID, and rating are required' 
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 })
    }

    const connection = await getConnection()
    
    // Verify user owns the order
    const [orders] = await connection.execute(
      'SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = "delivered"',
      [order_id, user.id || user.userId]
    )
    
    if ((orders as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Order not found or not eligible for review' 
      }, { status: 400 })
    }
    
    // Check if user already reviewed this product
    const [existingReviews] = await connection.execute(
      'SELECT id FROM product_reviews WHERE user_id = ? AND product_id = ?',
      [user.id || user.userId, product_id]
    )
    
    if ((existingReviews as any[]).length > 0) {
      await connection.end()
      return NextResponse.json({ 
        error: 'You have already reviewed this product' 
      }, { status: 400 })
    }
    
    // Check if product was in the order
    const [orderItems] = await connection.execute(
      'SELECT id FROM order_items WHERE order_id = ? AND product_id = ?',
      [order_id, product_id]
    )
    
    if ((orderItems as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Product not found in this order' 
      }, { status: 400 })
    }
    
    // Create review
    const [result] = await connection.execute(`
      INSERT INTO product_reviews (
        product_id, user_id, order_id, rating, title, review, is_verified_purchase
      ) VALUES (?, ?, ?, ?, ?, ?, TRUE)
    `, [product_id, user.id || user.userId, order_id, rating, title, review])
    
    await connection.end()
    
    return NextResponse.json({
      message: 'Review submitted successfully',
      reviewId: (result as any).insertId
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
