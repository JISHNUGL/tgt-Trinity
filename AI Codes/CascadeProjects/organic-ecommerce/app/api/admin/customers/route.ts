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

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customers = await tryDbQuery(
      `SELECT id, email, first_name, last_name, role, b2b_approved, created_at 
       FROM users WHERE role != 'admin' ORDER BY created_at DESC`
    )

    if (customers !== null) {
      return NextResponse.json({
        customers,
        total: (customers as any[]).length
      })
    }

    // Mock fallback
    return NextResponse.json({
      customers: [
        { id: 1, email: 'john@example.com', first_name: 'John', last_name: 'Doe', role: 'customer', created_at: '2024-01-15T10:00:00Z' },
        { id: 2, email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith', role: 'b2b', b2b_approved: true, created_at: '2024-01-20T10:00:00Z' },
        { id: 3, email: 'bob@example.com', first_name: 'Bob', last_name: 'Wilson', role: 'customer', created_at: '2024-02-01T10:00:00Z' }
      ],
      total: 3
    })

  } catch (error) {
    console.error('Customers fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
