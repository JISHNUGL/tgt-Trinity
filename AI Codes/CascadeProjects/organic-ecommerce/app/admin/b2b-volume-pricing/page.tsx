'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface VolumePricing {
  id: number
  product_id: number
  product_name: string
  min_quantity: number
  max_quantity: number | null
  discount_percentage: number
  base_price: number
  category_name: string
}

interface Product {
  id: number
  name: string
  price: number
  stock_quantity: number
  category_name: string
}

export default function B2BVolumePricingManagement() {
  const [volumePricing, setVolumePricing] = useState<VolumePricing[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPricing, setEditingPricing] = useState<VolumePricing | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    product_id: 0,
    min_quantity: 1,
    max_quantity: null as number | null,
    discount_percentage: 5
  })

  useEffect(() => {
    checkAdminAccess()
    fetchVolumePricing()
    fetchProducts()
  }, [])

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'admin') {
      router.push('/auth/login')
      return
    }
  }

  const fetchVolumePricing = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/b2b/volume-pricing', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setVolumePricing(data.volumePricing || [])
    } catch (error) {
      setError('Failed to load volume pricing')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const handleAddPricing = async (e: any) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/b2b/volume-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Volume pricing added successfully!')
        setShowAddForm(false)
        setFormData({
          product_id: 0,
          min_quantity: 1,
          max_quantity: null,
          discount_percentage: 5
        })
        fetchVolumePricing()
      } else {
        setError(result.error || 'Failed to add volume pricing')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const handleDeletePricing = async (pricingId: number) => {
    if (!confirm('Are you sure you want to delete this volume pricing tier?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/b2b/volume-pricing?id=${pricingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setVolumePricing(prev => prev.filter(p => p.id !== pricingId))
        setSuccess('Volume pricing deleted successfully')
      } else {
        setError('Failed to delete volume pricing')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const groupedPricing = volumePricing.reduce((acc, pricing) => {
    if (!acc[pricing.product_name]) {
      acc[pricing.product_name] = []
    }
    acc[pricing.product_name].push(pricing)
    return acc
  }, {} as Record<string, VolumePricing[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-organic-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-organic-primary">
            B2B Volume Pricing Management
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="btn-secondary"
            >
              Back to Admin
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add New Pricing Tier
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {showAddForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-organic-primary mb-6">
              Add Volume Pricing Tier
            </h2>
            
            <form onSubmit={handleAddPricing} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-organic-secondary font-semibold mb-2">
                  Product *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    product_id: parseInt(e.target.value)
                  }))}
                  className="input-field"
                  required
                >
                  <option value={0}>Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-organic-secondary font-semibold mb-2">
                  Minimum Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    min_quantity: parseInt(e.target.value)
                  }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-organic-secondary font-semibold mb-2">
                  Maximum Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_quantity || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    max_quantity: e.target.value ? parseInt(e.target.value) : null
                  }))}
                  className="input-field"
                  placeholder="Leave empty for no maximum"
                />
              </div>

              <div>
                <label className="block text-organic-secondary font-semibold mb-2">
                  Discount Percentage *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    discount_percentage: parseFloat(e.target.value)
                  }))}
                  className="input-field"
                  required
                />
              </div>

              <div className="lg:col-span-3 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Pricing Tier
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(groupedPricing).map(([productName, pricingTiers]) => (
            <div key={productName} className="card">
              <h3 className="text-lg font-semibold text-organic-primary mb-4">
                {productName}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-organic-muted/20">
                      <th className="text-left py-3 px-4 text-organic-secondary">
                        Quantity Range
                      </th>
                      <th className="text-left py-3 px-4 text-organic-secondary">
                        Discount
                      </th>
                      <th className="text-left py-3 px-4 text-organic-secondary">
                        Base Price
                      </th>
                      <th className="text-left py-3 px-4 text-organic-secondary">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 text-organic-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTiers.map((pricing) => (
                      <tr key={pricing.id} className="border-b border-organic-muted/10">
                        <td className="py-3 px-4">
                          {pricing.min_quantity}+
                          {pricing.max_quantity ? ` - ${pricing.max_quantity}` : ''}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {pricing.discount_percentage}% OFF
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          ${pricing.base_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {pricing.category_name}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeletePricing(pricing.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {volumePricing.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">
              No Volume Pricing Tiers
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding volume pricing tiers to products for B2B customers.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add First Pricing Tier
            </button>
          </div>
        )}

        <div className="mt-12 card">
          <h2 className="text-xl font-semibold text-organic-primary mb-4">
            Volume Pricing Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-organic-primary mb-2">
                Best Practices
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Set minimum quantities that make sense for bulk orders</li>
                <li>Offer progressive discounts for larger quantities</li>
                <li>Consider profit margins when setting discount percentages</li>
                <li>Review pricing tiers quarterly for optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-organic-primary mb-2">
                Common Tiers
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>10-49 units: 5% discount</li>
                <li>50-99 units: 10% discount</li>
                <li>100-249 units: 15% discount</li>
                <li>250+ units: 20% discount</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
