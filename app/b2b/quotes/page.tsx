'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Quote {
  id: number
  title: string
  status: string
  total_amount: number
  created_at: string
  items_count: number
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/b2b/quotes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes || [])
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <h1 className="text-4xl font-bold text-organic-primary">My Quotes</h1>
          <div className="space-x-4">
            <button onClick={() => router.push('/b2b/quotes/new')} className="btn-primary">
              Request New Quote
            </button>
            <button onClick={() => router.push('/b2b/dashboard')} className="btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">No Quotes Yet</h3>
            <p className="text-gray-600 mb-6">
              Request your first custom quote for bulk orders.
            </p>
            <button onClick={() => router.push('/b2b/quotes/new')} className="btn-primary">
              Request a Quote
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-organic-primary">
                      Quote #{quote.id} — {quote.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Created: {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                    <p className="text-lg font-bold text-organic-primary mt-1">
                      ${quote.total_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
