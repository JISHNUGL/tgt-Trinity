'use client'

import { useState, useEffect } from 'react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers
    .filter(c => roleFilter === 'all' || c.role === roleFilter)
    .filter(c =>
      `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-organic-primary">Customers</h1>
        <p className="text-gray-600 mt-1">{customers.length} customers total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs" placeholder="Search by name or email..."
        />
        <div className="flex gap-2">
          {['all', 'customer', 'b2b'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-organic-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role === 'all' ? 'All' : role === 'b2b' ? 'B2B' : 'Customer'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Customers</p>
          <p className="text-2xl font-bold text-organic-primary">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Regular</p>
          <p className="text-2xl font-bold text-blue-600">{customers.filter(c => c.role === 'customer').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-600">B2B</p>
          <p className="text-2xl font-bold text-purple-600">{customers.filter(c => c.role === 'b2b').length}</p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">#{customer.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-organic-primary text-sm">
                      {customer.first_name} {customer.last_name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      customer.role === 'b2b' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {customer.role === 'b2b' ? 'B2B' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No customers found.</p>
        )}
      </div>
    </div>
  )
}
