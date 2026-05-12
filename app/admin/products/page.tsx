'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  stock_quantity: number
  is_organic: boolean
  is_active: boolean
  category_name?: string
  category_slug?: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: 0,
    stock_quantity: 0, is_organic: true
  })

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      is_organic: product.is_organic
    })
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', price: 0, stock_quantity: 0, is_organic: true })
    setShowForm(true)
  }

  const handleSave = () => {
    if (editing) {
      // Update in-memory
      setProducts(products.map(p => p.id === editing.id ? {
        ...p, ...form
      } : p))
      setSuccess('Product updated successfully!')
    } else {
      // Add to in-memory
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        ...form,
        is_active: true,
        category_name: 'Uncategorized'
      }
      setProducts([newProduct, ...products])
      setSuccess('Product added successfully!')
    }
    setShowForm(false)
    setEditing(null)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
      setSuccess('Product deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleToggleActive = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p))
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-organic-primary">Products</h1>
          <p className="text-gray-600 mt-1">{products.length} products total</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          + Add Product
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-organic-primary mb-6">
              {editing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="input-field" required placeholder="e.g. Organic Avocados" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                  <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                    className="input-field" placeholder="auto-generated" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field" rows={3} placeholder="Product description..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Quantity *</label>
                  <input type="number" min="0" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="input-field" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 pb-2">
                    <input type="checkbox" checked={form.is_organic} onChange={e => setForm({ ...form, is_organic: e.target.checked })}
                      className="w-5 h-5 accent-organic-primary" />
                    <span className="text-sm font-semibold text-gray-700">Organic Certified</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={!form.name || form.price <= 0}>
                {editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-md" placeholder="Search products by name or category..."
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Organic</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">#{product.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-organic-primary text-sm">{product.name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.category_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-semibold">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${product.stock_quantity > 10 ? 'text-green-600' : product.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{product.is_organic ? '🌿' : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(product.id)}>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No products found.</p>
        )}
      </div>
    </div>
  )
}
