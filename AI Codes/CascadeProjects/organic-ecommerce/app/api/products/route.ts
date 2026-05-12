import { NextRequest, NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mockData'

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
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Try database first
    let whereClause = 'WHERE p.is_active = 1'
    let params: any[] = []

    if (category) {
      whereClause += ' AND c.slug = ?'
      params.push(category)
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    const productsQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `
    const dbParams = [...params, limit, offset]
    const dbProducts = await tryDbQuery(productsQuery, dbParams)

    if (dbProducts !== null) {
      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
      `
      const countResult = await tryDbQuery(countQuery, params)
      const total = (countResult as any[])?.[0]?.total || 0

      return NextResponse.json({
        products: dbProducts,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      })
    }

    // Fallback to mock data
    let filtered = mockProducts.filter(p => p.is_active)

    if (category) {
      filtered = filtered.filter(p => p.category_slug === category)
    }

    if (search) {
      const term = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      )
    }

    const total = filtered.length
    const paginated = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      products: paginated,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, price, stockQuantity, categoryId, imageUrl, isOrganic } = body

    const result = await tryDbQuery(
      `INSERT INTO products (name, slug, description, price, stock_quantity, category_id, image_url, is_organic) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, price, stockQuantity, categoryId, imageUrl, isOrganic]
    )

    if (result) {
      return NextResponse.json({
        message: 'Product created successfully',
        productId: (result as any).insertId
      })
    }

    return NextResponse.json(
      { error: 'Database not available. Product creation requires a database connection.' },
      { status: 503 }
    )

  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
