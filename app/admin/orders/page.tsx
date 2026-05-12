'use client'

import { useState, useEffect } from 'react'

interface Order {
  id: number
  order_number: string
  total_amount: number
  status: string
  first_name: string
  last_name: string
  email: string
  created_at: string
  item_count: number
  items?: any[]
  shipping_address?: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setSuccess(`Order status updated to "${newStatus}"`)
    setTimeout(() => setSuccess(''), 3000)
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const statusFlow = ['pending', 'processing', 'shipped', 'delivered']

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-organic-primary">Orders</h1>
        <p className="text-gray-600 mt-1">{orders.length} orders total</p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
          const count = status === 'all' ? orders.length : orders.filter(o => o.status === status).length
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-organic-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {count > 0 && <span className="ml-2 bg-white/30 px-1.5 py-0.5 rounded-full text-xs">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-organic-primary">{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-600">Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-organic-primary">${selectedOrder.total_amount?.toFixed(2)}</p>
              </div>
            </div>

            {selectedOrder.shipping_address && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.shipping_address}</p>
              </div>
            )}

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-gray-500">Qty: {item.quantity} × ${item.unit_price?.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold">${item.total_price?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statusFlow.map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedOrder.id, status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedOrder.status === status
                        ? 'bg-organic-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedOrder.status === 'cancelled'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Order #</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-organic-primary text-sm">{order.order_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.first_name} {order.last_name}</td>
                  <td className="px-4 py-3 text-sm font-semibold">${order.total_amount?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No orders found.</p>
        )}
      </div>
    </div>
  )
}
