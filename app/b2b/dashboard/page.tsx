'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface B2BDashboard {
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  pendingQuotes: number
  activeReorders: number
  recentOrders: any[]
  volumeSavings: number
}

export default function B2BDashboard() {
  const [dashboard, setDashboard] = useState<B2BDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkB2BAccess()
    fetchDashboardData()
  }, [])

  const checkB2BAccess = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'b2b' || !user.b2bApproved) {
      router.push('/auth/login')
      return
    }
  }

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [ordersRes, quotesRes, reordersRes] = await Promise.all([
        fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/b2b/quotes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/b2b/reorders', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const ordersData = await ordersRes.json()
      const quotesData = await quotesRes.json()
      const reordersData = await reordersRes.json()

      const totalSpent = ordersData.orders?.reduce((sum: number, order: any) => 
        order.status !== 'cancelled' ? sum + parseFloat(order.total_amount) : sum, 0) || 0
      
      const avgOrderValue = ordersData.orders?.length > 0 ? 
        totalSpent / ordersData.orders.filter((o: any) => o.status !== 'cancelled').length : 0

      setDashboard({
        totalOrders: ordersData.orders?.filter((o: any) => o.status !== 'cancelled').length || 0,
        totalSpent,
        avgOrderValue,
        pendingQuotes: quotesData.quotes?.filter((q: any) => q.status === 'pending').length || 0,
        activeReorders: reordersData.repeatedOrders?.length || 0,
        recentOrders: ordersData.orders?.slice(0, 5) || [],
        volumeSavings: totalSpent * 0.08 // Estimated 8% savings from volume pricing
      })
    } catch (error) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-organic-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-organic-white flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl text-red-600 mb-4">{error}</h3>
          <button onClick={fetchDashboardData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-organic-primary">
            B2B Dashboard
          </h1>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-organic-primary">
                  {dashboard?.totalOrders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-organic-accent/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-organic-primary">
                  ${dashboard?.totalSpent.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Order Value</p>
                <p className="text-3xl font-bold text-organic-primary">
                  ${dashboard?.avgOrderValue.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Quotes</p>
                <p className="text-3xl font-bold text-organic-primary">
                  {dashboard?.pendingQuotes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Quick Reorders</p>
                <p className="text-3xl font-bold text-organic-primary">
                  {dashboard?.activeReorders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Volume Savings</p>
                <p className="text-3xl font-bold text-green-600">
                  ${dashboard?.volumeSavings.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-organic-primary mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/b2b/quotes/new')}
                className="p-4 bg-organic-accent/20 rounded-lg hover:bg-organic-accent/30 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-semibold text-organic-primary">Request Quote</div>
                <div className="text-sm text-gray-600">Get custom pricing</div>
              </button>

              <button
                onClick={() => router.push('/b2b/reorders')}
                className="p-4 bg-organic-accent/20 rounded-lg hover:bg-organic-accent/30 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-semibold text-organic-primary">Quick Reorder</div>
                <div className="text-sm text-gray-600">Repeat past orders</div>
              </button>

              <button
                onClick={() => router.push('/b2b/volume-pricing')}
                className="p-4 bg-organic-accent/20 rounded-lg hover:bg-organic-accent/30 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-organic-primary">Volume Pricing</div>
                <div className="text-sm text-gray-600">View bulk discounts</div>
              </button>

              <button
                onClick={() => router.push('/b2b/account')}
                className="p-4 bg-organic-accent/20 rounded-lg hover:bg-organic-accent/30 transition-colors text-left"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold text-organic-primary">Account Settings</div>
                <div className="text-sm text-gray-600">Manage preferences</div>
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-organic-primary mb-6">
              Recent Orders
            </h2>
            <div className="space-y-3">
              {dashboard?.recentOrders?.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No recent orders</p>
              ) : (
                dashboard?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-organic-primary">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-organic-primary">${order.total_amount}</p>
                      <p className="text-sm text-gray-600">{order.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {dashboard?.recentOrders?.length > 0 && (
              <button
                onClick={() => router.push('/orders')}
                className="w-full mt-4 text-organic-primary hover:text-organic-secondary transition-colors"
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
