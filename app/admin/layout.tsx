'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Products', icon: '📦' },
  { path: '/admin/orders', label: 'Orders', icon: '🛒' },
  { path: '/admin/customers', label: 'Customers', icon: '👥' },
  { path: '/admin/b2b-applications', label: 'B2B Applications', icon: '⏳' },
  { path: '/admin/b2b-quotes', label: 'B2B Quotes', icon: '📋' },
  { path: '/admin/b2b-volume-pricing', label: 'Volume Pricing', icon: '💰' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (!storedUser || storedUser.role !== 'admin') {
      router.push('/auth/login')
      return
    }
    setUser(storedUser)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-organic-secondary text-white transition-all duration-300 flex flex-col fixed h-full z-30`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-bold text-organic-accent">Admin Panel</h2>
                <p className="text-xs text-white/60">{user?.firstName} {user?.lastName}</p>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-organic-primary text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors mb-2"
          >
            <span className="text-lg">🏠</span>
            {sidebarOpen && <span className="ml-3 text-sm">View Store</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-colors"
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {children}
      </main>
    </div>
  )
}
