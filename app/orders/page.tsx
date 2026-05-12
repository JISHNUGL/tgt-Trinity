'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Order {
  id: number
  user_id: number
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string
  payment_method: string
  created_at: string
  updated_at: string
  items: Array<{
    id: number
    product_id: number
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}
  const isB2B = user.role === 'b2b' && user.b2bApproved

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
  }

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setError('Failed to load orders')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createReorder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/b2b/reorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          orderName: `Reorder from Order #${orderId}`
        })
      })

      if (response.ok) {
        alert('Reorder template created successfully! You can find it in Quick Reorders.')
      } else {
        const error = await response.json()
        alert('Failed to create reorder: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
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
            My Orders
          </h1>
          <div className="space-x-4">
            {isB2B && (
              <button
                onClick={() => router.push('/b2b/reorders')}
                className="btn-secondary"
              >
                Quick Reorders
              </button>
            )}
            <button
              onClick={() => router.push('/products')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <button
              onClick={() => router.push('/products')}
              className="btn-primary"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-organic-primary">
                      Order #{order.id}
                    </h3>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {isB2B && order.status === 'delivered' && (
                      <button
                        onClick={() => createReorder(order.id)}
                        className="text-organic-primary hover:text-organic-secondary transition-colors text-sm font-medium"
                      >
                        Create Reorder
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-semibold text-lg">${order.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <p className="font-medium">{order.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <p className="font-medium">{order.items.length} products</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-gray-600">Shipping Address:</span>
                  <p className="text-sm mt-1 bg-gray-50 p-2 rounded">
                    {order.shipping_address}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-organic-primary mb-3">
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            ${item.unit_price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.updated_at !== order.created_at && (
                  <div className="mt-4 text-sm text-gray-600">
                    Last updated: {formatDate(order.updated_at)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
