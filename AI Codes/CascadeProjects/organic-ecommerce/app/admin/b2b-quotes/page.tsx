'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface QuoteRequest {
  id: number
  user_id: number
  business_name: string
  contact_person: string
  email: string
  phone: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  total_amount: number
  notes: string
  created_at: string
  updated_at: string
  admin_notes: string
  items: Array<{
    product_id: number
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    notes: string
  }>
}

export default function B2BQuoteManagement() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
    fetchQuotes()
  }, [statusFilter])

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'admin') {
      router.push('/auth/login')
      return
    }
  }

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = statusFilter === 'all' 
        ? '/api/b2b/quotes' 
        : `/api/b2b/quotes?status=${statusFilter}`
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setQuotes(data.quotes || [])
    } catch (error) {
      setError('Failed to load quote requests')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuoteStatus = async (quoteId: number, status: string, adminNotes: string = '') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/b2b/quotes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quoteId,
          status,
          adminNotes
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(`Quote ${status} successfully`)
        setSelectedQuote(null)
        fetchQuotes()
      } else {
        setError(result.error || 'Failed to update quote status')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
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
            B2B Quote Management
          </h1>
          <button
            onClick={() => router.push('/admin')}
            className="btn-secondary"
          >
            Back to Admin
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

        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-organic-primary">
              Quote Requests
            </h2>
            
            <div className="flex items-center space-x-4">
              <label className="text-organic-secondary font-medium">
                Filter by Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">All Quotes</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">
              No Quote Requests Found
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'No quote requests have been submitted yet.'
                : `No ${statusFilter} quote requests found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <div key={quote.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-organic-primary">
                      {quote.business_name}
                    </h3>
                    <p className="text-gray-600">
                      Contact: {quote.contact_person} ({quote.email})
                    </p>
                    {quote.phone && (
                      <p className="text-gray-600">Phone: {quote.phone}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="text-organic-primary hover:text-organic-secondary transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Quote ID:</span>
                    <span className="ml-2 font-medium">#{quote.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-medium">${quote.total_amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted:</span>
                    <span className="ml-2 font-medium">{formatDate(quote.created_at)}</span>
                  </div>
                </div>

                {quote.items && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Items: {quote.items.length} products
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-organic-primary mb-2">
                      Quote Request Details
                    </h2>
                    <p className="text-gray-600">Quote ID: #{selectedQuote.id}</p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold text-organic-primary mb-4">
                      Business Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600">Business Name:</span>
                        <p className="font-medium">{selectedQuote.business_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Contact Person:</span>
                        <p className="font-medium">{selectedQuote.contact_person}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{selectedQuote.email}</p>
                      </div>
                      {selectedQuote.phone && (
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <p className="font-medium">{selectedQuote.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-organic-primary mb-4">
                      Quote Status
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuote.status)}`}>
                          {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <p className="text-xl font-bold text-organic-primary">
                          ${selectedQuote.total_amount.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600">Submitted:</span>
                        <p className="font-medium">{formatDate(selectedQuote.created_at)}</p>
                      </div>

                      {selectedQuote.updated_at !== selectedQuote.created_at && (
                        <div>
                          <span className="text-gray-600">Last Updated:</span>
                          <p className="font-medium">{formatDate(selectedQuote.updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedQuote.items && selectedQuote.items.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-organic-primary mb-4">
                      Quote Items
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-organic-muted/20">
                            <th className="text-left py-2 px-4 text-organic-secondary">
                              Product
                            </th>
                            <th className="text-left py-2 px-4 text-organic-secondary">
                              Quantity
                            </th>
                            <th className="text-left py-2 px-4 text-organic-secondary">
                              Unit Price
                            </th>
                            <th className="text-left py-2 px-4 text-organic-secondary">
                              Total Price
                            </th>
                            <th className="text-left py-2 px-4 text-organic-secondary">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedQuote.items.map((item, index) => (
                            <tr key={index} className="border-b border-organic-muted/10">
                              <td className="py-2 px-4">
                                {item.product_name || `Product #${item.product_id}`}
                              </td>
                              <td className="py-2 px-4">{item.quantity}</td>
                              <td className="py-2 px-4">${item.unit_price.toFixed(2)}</td>
                              <td className="py-2 px-4">${item.total_price.toFixed(2)}</td>
                              <td className="py-2 px-4">
                                {item.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedQuote.notes && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-organic-primary mb-2">
                      Customer Notes
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedQuote.notes}
                    </p>
                  </div>
                )}

                {selectedQuote.admin_notes && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-organic-primary mb-2">
                      Admin Notes
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedQuote.admin_notes}
                    </p>
                  </div>
                )}

                {selectedQuote.status === 'pending' && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-organic-primary mb-4">
                      Take Action
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-organic-secondary font-medium mb-2">
                          Admin Notes (optional)
                        </label>
                        <textarea
                          id="adminNotes"
                          className="input-field"
                          rows={3}
                          placeholder="Add notes about this decision..."
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            const notes = (document.getElementById('adminNotes') as HTMLTextAreaElement)?.value || ''
                            handleUpdateQuoteStatus(selectedQuote.id, 'approved', notes)
                          }}
                          className="btn-primary"
                        >
                          Approve Quote
                        </button>
                        
                        <button
                          onClick={() => {
                            const notes = (document.getElementById('adminNotes') as HTMLTextAreaElement)?.value || ''
                            handleUpdateQuoteStatus(selectedQuote.id, 'rejected', notes)
                          }}
                          className="btn-secondary bg-red-500 hover:bg-red-600 text-white"
                        >
                          Reject Quote
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
