'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RepeatedOrder {
  id: number
  order_name: string
  total_amount: number
  last_ordered: string
  order_count: number
  original_order_number: string
  original_order_date: string
  items: Array<{
    product_id: number
    quantity: number
    unit_price: number
    total_price: number
  }>
}

export default function QuickReorders() {
  const [reorders, setReorders] = useState<RepeatedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reordering, setReordering] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkB2BAccess()
    fetchReorders()
  }, [])

  const checkB2BAccess = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'b2b' || !user.b2bApproved) {
      router.push('/auth/login')
      return
    }
  }

  const fetchReorders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/b2b/reorders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setReorders(data.repeatedOrders || [])
    } catch (error) {
      setError('Failed to load reorder templates')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickReorder = async (reorderId: number) => {
    setReordering(reorderId)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const reorder = reorders.find(r => r.id === reorderId)
      
      if (!reorder) {
        throw new Error('Reorder not found')
      }

      // Convert reorder items to cart format
      const cartItems = reorder.items.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        name: '', // Will be filled by API
        price: item.unit_price
      }))

      // Add items to cart
      for (const item of cartItems) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(item)
        })
      }

      setSuccess('Items added to cart! Redirecting to checkout...')
      setTimeout(() => {
        router.push('/checkout')
      }, 2000)

    } catch (error) {
      setError('Failed to process reorder')
    } finally {
      setReordering(null)
    }
  }

  const handleDeleteReorder = async (reorderId: number) => {
    if (!confirm('Are you sure you want to delete this reorder template?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/b2b/reorders?reorderId=${reorderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setReorders(prev => prev.filter(r => r.id !== reorderId))
        setSuccess('Reorder template deleted successfully')
      } else {
        setError('Failed to delete reorder template')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

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
            Quick Reorders
          </h1>
          <button
            onClick={() => router.push('/b2b/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
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

        {reorders.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">
              No Reorder Templates
            </h3>
            <p className="text-gray-600 mb-6">
              Create reorder templates from your completed orders to quickly reorder your favorite products.
            </p>
            <button
              onClick={() => router.push('/orders')}
              className="btn-primary"
            >
              View Order History
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reorders.map((reorder) => (
              <div key={reorder.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-organic-primary">
                    {reorder.order_name}
                  </h3>
                  <button
                    onClick={() => handleDeleteReorder(reorder.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-organic-primary">
                      ${reorder.total_amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">
                      {reorder.items.length} products
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Times Reordered:</span>
                    <span className="font-medium">
                      {reorder.order_count}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Ordered:</span>
                    <span className="font-medium">
                      {formatDate(reorder.last_ordered)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Order:</span>
                    <span className="font-medium">
                      {reorder.original_order_number}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-organic-primary mb-2">Items:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {reorder.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        Product #{item.product_id} - Qty: {item.quantity}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleQuickReorder(reorder.id)}
                  disabled={reordering === reorder.id}
                  className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reordering === reorder.id ? 'Processing...' : 'Quick Reorder'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 card">
          <h2 className="text-xl font-semibold text-organic-primary mb-4">
            How to Create Reorder Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">1️⃣</div>
              <h3 className="font-semibold text-organic-primary mb-2">
                Complete an Order
              </h3>
              <p className="text-sm text-gray-600">
                First, place and complete a regular order through our checkout process.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">2️⃣</div>
              <h3 className="font-semibold text-organic-primary mb-2">
                Save as Template
              </h3>
              <p className="text-sm text-gray-600">
                From your order history, save completed orders as reorder templates.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <h3 className="font-semibold text-organic-primary mb-2">
                Quick Reorder
              </h3>
              <p className="text-sm text-gray-600">
                Use this page to quickly reorder your favorite products with one click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
