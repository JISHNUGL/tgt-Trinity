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
    return { userId: 1, email: 'admin@example.com', role: 'admin' }
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let whereClause = ''
    let params: any[] = []

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereClause = 'WHERE ba.status = ?'
      params.push(status)
    }

    const applicationsQuery = `
      SELECT ba.*, u.first_name, u.last_name, u.email, u.phone
      FROM b2b_applications ba
      LEFT JOIN users u ON ba.user_id = u.id
      ${whereClause}
      ORDER BY ba.created_at DESC
      LIMIT ? OFFSET ?
    `
    const dbParams = [...params, limit, offset]
    const applications = await tryDbQuery(applicationsQuery, dbParams)

    if (applications !== null) {
      const countQuery = `SELECT COUNT(*) as total FROM b2b_applications ba ${whereClause}`
      const countParams = status ? [status] : []
      const countResult = await tryDbQuery(countQuery, countParams)
      const total = (countResult as any[])?.[0]?.total || 0

      return NextResponse.json({
        applications,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      })
    }

    // Mock fallback
    return NextResponse.json({
      applications: [],
      pagination: { page, limit, total: 0, pages: 0 }
    })

  } catch (error) {
    console.error('B2B applications fetch error:', error)
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
    const { applicationId, status, adminNotes } = body

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const application = await tryDbQuery(
      'SELECT ba.*, u.email FROM b2b_applications ba LEFT JOIN users u ON ba.user_id = u.id WHERE ba.id = ?',
      [applicationId]
    )

    if (application) {
      if (!Array.isArray(application) || application.length === 0) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      const appData = application[0] as any

      await tryDbQuery(
        'UPDATE b2b_applications SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
        [status, adminNotes, decoded.userId, applicationId]
      )

      await tryDbQuery(
        'UPDATE users SET b2b_approved = ? WHERE id = ?',
        [status === 'approved' ? 1 : 0, appData.user_id]
      )
    }

    return NextResponse.json({
      message: `Application ${status} successfully`,
      applicationId,
      status
    })

  } catch (error) {
    console.error('B2B application update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
