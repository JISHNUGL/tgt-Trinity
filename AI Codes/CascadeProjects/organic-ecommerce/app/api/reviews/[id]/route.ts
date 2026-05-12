import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await getConnection()
    
    // Get review with detailed information
    const [reviews] = await connection.execute(`
      SELECT 
        pr.*,
        u.first_name,
        u.last_name,
        u.email,
        p.name as product_name,
        p.image_url as product_image,
        o.created_at as order_date,
        o.total_amount as order_total,
        CASE 
          WHEN pr.is_approved = TRUE THEN 'approved'
          WHEN pr.is_rejected = TRUE THEN 'rejected'
          ELSE 'pending'
        END as review_status
      FROM product_reviews pr
      INNER JOIN users u ON pr.user_id = u.id
      INNER JOIN products p ON pr.product_id = p.id
      INNER JOIN orders o ON pr.order_id = o.id
      WHERE pr.id = ?
    `, [params.id])
    
    if ((reviews as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    
    // Get helpful votes
    const [votes] = await connection.execute(`
      SELECT 
        rv.is_helpful,
        u.first_name,
        u.last_name,
        rv.created_at
      FROM review_votes rv
      INNER JOIN users u ON rv.user_id = u.id
      WHERE rv.review_id = ?
      ORDER BY rv.created_at DESC
    `, [params.id])
    
    await connection.end()
    
    return NextResponse.json({
      review: (reviews as any)[0],
      votes
    })
  } catch (error) {
    console.error('Get review error:', error)
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
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
      action, // approve, reject, update
      title,
      review,
      admin_notes
    } = await request.json()

    const connection = await getConnection()
    
    // Check if review exists
    const [existingReviews] = await connection.execute(
      'SELECT id FROM product_reviews WHERE id = ?',
      [params.id]
    )
    
    if ((existingReviews as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    
    if (action === 'approve') {
      await connection.execute(
        'UPDATE product_reviews SET is_approved = TRUE, is_rejected = FALSE WHERE id = ?',
        [params.id]
      )
      
      await connection.end()
      return NextResponse.json({ message: 'Review approved successfully' })
      
    } else if (action === 'reject') {
      await connection.execute(
        'UPDATE product_reviews SET is_approved = FALSE, is_rejected = TRUE WHERE id = ?',
        [params.id]
      )
      
      await connection.end()
      return NextResponse.json({ message: 'Review rejected successfully' })
      
    } else if (action === 'update') {
      // Update review content (admin edit)
      if (title !== undefined || review !== undefined) {
        const updateFields = []
        const updateValues = []
        
        if (title !== undefined) {
          updateFields.push('title = ?')
          updateValues.push(title)
        }
        
        if (review !== undefined) {
          updateFields.push('review = ?')
          updateValues.push(review)
        }
        
        if (admin_notes !== undefined) {
          updateFields.push('admin_notes = ?')
          updateValues.push(admin_notes)
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP')
        updateValues.push(params.id)
        
        await connection.execute(
          `UPDATE product_reviews SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        )
      }
      
      await connection.end()
      return NextResponse.json({ message: 'Review updated successfully' })
      
    } else {
      await connection.end()
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
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
    
    // Check if review exists
    const [existingReviews] = await connection.execute(
      'SELECT id FROM product_reviews WHERE id = ?',
      [params.id]
    )
    
    if ((existingReviews as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    
    // Delete review and related votes
    await connection.execute('DELETE FROM review_votes WHERE review_id = ?', [params.id])
    await connection.execute('DELETE FROM product_reviews WHERE id = ?', [params.id])
    
    await connection.end()
    
    return NextResponse.json({ message: 'Review deleted successfully' })
    
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
