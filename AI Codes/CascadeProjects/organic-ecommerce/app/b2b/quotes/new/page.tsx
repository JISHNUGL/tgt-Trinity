'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  price: number
  stock_quantity: number
  image_url?: string
}

export default function NewQuoteRequest() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const [quoteData, setQuoteData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'CA'
    },
    notes: '',
    items: [] as Array<{
      productId: number
      quantity: number
      notes: string
    }>
  })

  useEffect(() => {
    checkB2BAccess()
    fetchProducts()
  }, [])

  const checkB2BAccess = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'b2b' || !user.b2bApproved) {
      router.push('/auth/login')
      return
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const addItemToQuote = (product: Product) => {
    setQuoteData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: product.id,
        quantity: 1,
        notes: ''
      }]
    }))
  }

  const updateQuoteItem = (index: number, field: string, value: any) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeQuoteItem = (index: number) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateQuoteTotal = () => {
    return quoteData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId)
      return total + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/b2b/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quoteData)
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Quote request submitted successfully! We will contact you within 24 hours.')
        setTimeout(() => {
          router.push('/b2b/quotes')
        }, 2000)
      } else {
        setError(result.error || 'Failed to submit quote request')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
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
          <h1 className="text-4xl font-bold text-organic-primary">
            Request Quote
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

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-organic-primary mb-6">
                  Business Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={quoteData.businessName}
                      onChange={(e) => setQuoteData(prev => ({
                        ...prev,
                        businessName: e.target.value
                      }))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={quoteData.contactPerson}
                      onChange={(e) => setQuoteData(prev => ({
                        ...prev,
                        contactPerson: e.target.value
                      }))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={quoteData.email}
                      onChange={(e) => setQuoteData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={quoteData.phone}
                      onChange={(e) => setQuoteData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold text-organic-primary mb-6">
                  Shipping Address
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={quoteData.shippingAddress.street}
                      onChange={(e) => setQuoteData(prev => ({
                        ...prev,
                        shippingAddress: {
                          ...prev.shippingAddress,
                          street: e.target.value
                        }
                      }))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={quoteData.shippingAddress.city}
                        onChange={(e) => setQuoteData(prev => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            city: e.target.value
                          }
                        }))}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        value={quoteData.shippingAddress.state}
                        onChange={(e) => setQuoteData(prev => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            state: e.target.value
                          }
                        }))}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        value={quoteData.shippingAddress.zipCode}
                        onChange={(e) => setQuoteData(prev => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            zipCode: e.target.value
                          }
                        }))}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Country *
                      </label>
                      <select
                        value={quoteData.shippingAddress.country}
                        onChange={(e) => setQuoteData(prev => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            country: e.target.value
                          }
                        }))}
                        className="input-field"
                        required
                      >
                        <option value="CA">Canada</option>
                        <option value="US">United States</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-xl font-semibold text-organic-primary mb-6">
                  Quote Items
                </h2>
                
                <div className="space-y-4 mb-6">
                  {quoteData.items.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">
                      Add items to your quote request
                    </p>
                  ) : (
                    quoteData.items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId)
                      return (
                        <div key={index} className="border border-organic-muted/20 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <select
                                value={item.productId}
                                onChange={(e) => updateQuoteItem(index, 'productId', parseInt(e.target.value))}
                                className="input-field mb-2"
                              >
                                <option value="">Select a product</option>
                                {products.map(product => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - ${product.price}
                                  </option>
                                ))}
                              </select>
                              
                              {product && (
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <label className="block text-sm text-organic-secondary mb-1">
                                      Quantity
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max={product.stock_quantity}
                                      value={item.quantity}
                                      onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value))}
                                      className="input-field w-24"
                                    />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <label className="block text-sm text-organic-secondary mb-1">
                                      Item Notes
                                    </label>
                                    <input
                                      type="text"
                                      value={item.notes}
                                      onChange={(e) => updateQuoteItem(index, 'notes', e.target.value)}
                                      className="input-field"
                                      placeholder="Any special requirements..."
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => removeQuoteItem(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          
                          {product && (
                            <div className="text-sm text-gray-600">
                              Unit Price: ${product.price} | 
                              Subtotal: ${product.price * item.quantity} | 
                              Available: {product.stock_quantity} units
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuoteData(prev => ({
                      ...prev,
                      items: [...prev.items, {
                        productId: 0,
                        quantity: 1,
                        notes: ''
                      }]
                    }))
                  }}
                  className="w-full btn-secondary mb-6"
                >
                  + Add Another Item
                </button>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-organic-primary">
                      Estimated Total:
                    </span>
                    <span className="text-2xl font-bold text-organic-primary">
                      ${calculateQuoteTotal().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    * Final pricing will be provided in the quote response
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-organic-primary mb-6">
              Additional Notes
            </h2>
            
            <textarea
              value={quoteData.notes}
              onChange={(e) => setQuoteData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="input-field"
              rows={4}
              placeholder="Any special requirements, delivery instructions, or other details..."
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting || quoteData.items.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8"
            >
              {submitting ? 'Submitting...' : 'Submit Quote Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
