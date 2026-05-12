'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  overview: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    uniqueCustomers: number
    totalProducts: number
    activeProducts: number
  }
  topProducts: Array<{ id: number; name: string; total_sold: number; total_revenue: number }>
  topCategories: Array<{ name: string; total_sold: number; total_revenue: number }>
  orderStatus: Array<{ status: string; count: number; total_value: number }>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchAnalytics() }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError('Failed to load analytics data')
      }
    } catch (error) {
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500'
      case 'shipped': return 'bg-purple-500'
      case 'processing': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-xl text-red-600 mb-4">{error}</h3>
          <button onClick={fetchAnalytics} className="btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  const { overview, topProducts, topCategories, orderStatus } = data
  const totalOrderCount = orderStatus.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-organic-primary">Analytics</h1>
        <p className="text-gray-600 mt-1">Sales performance and business insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-1">${overview.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-600">Orders</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{overview.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-600">Avg. Order Value</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">${overview.averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-600">Unique Customers</p>
          <p className="text-3xl font-bold text-teal-600 mt-1">{overview.uniqueCustomers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-organic-primary mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sales data available</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => {
                const maxSold = Math.max(...topProducts.map(p => p.total_sold))
                const barWidth = maxSold > 0 ? (product.total_sold / maxSold) * 100 : 0
                return (
                  <div key={product.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800">{product.name}</span>
                      <span className="text-sm text-gray-600">{product.total_sold} sold</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-organic-primary rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">${product.total_revenue.toFixed(2)} revenue</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-organic-primary mb-4">Order Status</h2>
          {orderStatus.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No order data</p>
          ) : (
            <div className="space-y-4">
              {orderStatus.map(status => {
                const percentage = totalOrderCount > 0 ? (status.count / totalOrderCount) * 100 : 0
                return (
                  <div key={status.status}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`} />
                        <span className="text-sm font-medium capitalize">{status.status}</span>
                      </div>
                      <span className="text-sm text-gray-600">{status.count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getStatusColor(status.status)}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">${status.total_value.toFixed(2)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-organic-primary mb-4">Revenue by Category</h2>
        {topCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No category data</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topCategories.map((cat, i) => (
              <div key={cat.name} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">{cat.name}</p>
                <p className="text-xl font-bold text-organic-primary">${cat.total_revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{cat.total_sold} items sold</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
