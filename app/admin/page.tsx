'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  pendingB2BApplications: number
  totalRevenue: number
  recentOrders: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [productsRes, ordersRes, customersRes, b2bRes] = await Promise.all([
        fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/customers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/b2b-applications?status=pending', { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      const productsData = await productsRes.json()
      const ordersData = await ordersRes.json()
      const customersData = await customersRes.json()
      const b2bData = await b2bRes.json()

      const orders = ordersData.orders || []
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)

      setStats({
        totalProducts: productsData.pagination?.total || 0,
        totalOrders: ordersData.pagination?.total || 0,
        totalCustomers: customersData.total || 0,
        pendingB2BApplications: b2bData.pagination?.total || 0,
        totalRevenue,
        recentOrders: orders.slice(0, 5)
      })
    } catch (error) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-xl text-red-600 mb-4">{error}</h3>
          <button onClick={fetchDashboardStats} className="btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: '💰', color: 'bg-green-50 border-green-200', iconBg: 'bg-green-100' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', color: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-100' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: '📦', color: 'bg-purple-50 border-purple-200', iconBg: 'bg-purple-100' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: '👥', color: 'bg-teal-50 border-teal-200', iconBg: 'bg-teal-100' },
    { label: 'Pending B2B', value: stats?.pendingB2BApplications || 0, icon: '⏳', color: 'bg-orange-50 border-orange-200', iconBg: 'bg-orange-100' },
  ]

  const quickActions = [
    { label: 'Manage Products', desc: 'Add, edit, remove products', icon: '📦', path: '/admin/products' },
    { label: 'Manage Orders', desc: 'View and update order status', icon: '🛒', path: '/admin/orders' },
    { label: 'Customers', desc: 'View customer data', icon: '👥', path: '/admin/customers' },
    { label: 'B2B Applications', desc: 'Review business applications', icon: '⏳', path: '/admin/b2b-applications' },
    { label: 'B2B Quotes', desc: 'Manage quote requests', icon: '📋', path: '/admin/b2b-quotes' },
    { label: 'Volume Pricing', desc: 'Set B2B discount tiers', icon: '💰', path: '/admin/b2b-volume-pricing' },
    { label: 'Analytics', desc: 'Sales & performance data', icon: '📈', path: '/admin/analytics' },
  ]

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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-organic-primary">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your store overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`rounded-xl border p-4 ${card.color}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">{card.label}</p>
              <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
                <span className="text-lg">{card.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-organic-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map(action => (
                <button
                  key={action.path}
                  onClick={() => router.push(action.path)}
                  className="p-4 rounded-xl bg-gray-50 hover:bg-organic-accent/15 border border-gray-100 hover:border-organic-accent/30 transition-all text-left group"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <p className="font-semibold text-organic-primary mt-2 text-sm group-hover:text-organic-secondary">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-organic-primary mb-4">Recent Orders</h2>
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-organic-primary truncate">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{order.first_name} {order.last_name}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-semibold text-sm">${order.total_amount?.toFixed(2)}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {(stats?.recentOrders?.length || 0) > 0 && (
              <button
                onClick={() => router.push('/admin/orders')}
                className="w-full mt-4 text-sm text-organic-primary hover:text-organic-secondary transition-colors font-medium"
              >
                View All Orders →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
