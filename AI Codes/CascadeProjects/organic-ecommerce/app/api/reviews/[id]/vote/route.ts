import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isHelpful } = await request.json()

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json({ 
        error: 'isHelpful must be a boolean value' 
      }, { status: 400 })
    }

    const connection = await getConnection()
    
    // Check if review exists
    const [reviews] = await connection.execute(
      'SELECT id FROM product_reviews WHERE id = ? AND is_approved = TRUE',
      [params.id]
    )
    
    if ((reviews as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ 
        error: 'Review not found or not approved' 
      }, { status: 404 })
    }
    
    // Check if user already voted
    const [existingVotes] = await connection.execute(
      'SELECT id, is_helpful FROM review_votes WHERE review_id = ? AND user_id = ?',
      [params.id, user.id || user.userId]
    )
    
    if ((existingVotes as any[]).length > 0) {
      const existingVote = (existingVotes as any)[0]
      
      if (existingVote.is_helpful === isHelpful) {
        // Remove vote if clicking the same option
        await connection.execute(
          'DELETE FROM review_votes WHERE review_id = ? AND user_id = ?',
          [params.id, user.id || user.userId]
        )
        
        // Update helpful count
        await connection.execute(
          'UPDATE product_reviews SET helpful_count = helpful_count - 1 WHERE id = ?',
          [params.id]
        )
        
        await connection.end()
        return NextResponse.json({ 
          message: 'Vote removed successfully',
          voted: false
        })
      } else {
        // Update vote if changing from helpful to not helpful or vice versa
        await connection.execute(
          'UPDATE review_votes SET is_helpful = ? WHERE review_id = ? AND user_id = ?',
          [isHelpful, params.id, user.id || user.userId]
        )
        
        // Update helpful count
        if (isHelpful) {
          await connection.execute(
            'UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
            [params.id]
          )
        } else {
          await connection.execute(
            'UPDATE product_reviews SET helpful_count = helpful_count - 1 WHERE id = ?',
            [params.id]
          )
        }
        
        await connection.end()
        return NextResponse.json({ 
          message: 'Vote updated successfully',
          voted: true,
          isHelpful
        })
      }
    } else {
      // Add new vote
      await connection.execute(
        'INSERT INTO review_votes (review_id, user_id, is_helpful) VALUES (?, ?, ?)',
        [params.id, user.id || user.userId, isHelpful]
      )
      
      // Update helpful count if vote is helpful
      if (isHelpful) {
        await connection.execute(
          'UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
          [params.id]
        )
      }
      
      await connection.end()
      return NextResponse.json({ 
        message: 'Vote recorded successfully',
        voted: true,
        isHelpful
      })
    }
    
  } catch (error) {
    console.error('Vote on review error:', error)
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
  }
}
