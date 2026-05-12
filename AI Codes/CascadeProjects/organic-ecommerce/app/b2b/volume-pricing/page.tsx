'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  price: number
  stock_quantity: number
  category_name: string
  discount_percentage?: number
  b2b_price?: number
}

interface VolumePricing {
  id: number
  product_id: number
  product_name: string
  min_quantity: number
  max_quantity: number | null
  discount_percentage: number
  base_price: number
  category_name: string
}

export default function VolumePricing() {
  const [products, setProducts] = useState<Product[]>([])
  const [volumePricing, setVolumePricing] = useState<VolumePricing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkB2BAccess()
    fetchPricing()
  }, [])

  const checkB2BAccess = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'b2b' || !user.b2bApproved) {
      router.push('/auth/login')
      return
    }
  }

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/b2b/volume-pricing', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setVolumePricing(data.volumePricing || [])
      
      // Extract unique products with B2B pricing
      const uniqueProducts = data.volumePricing?.reduce((acc: any[], vp: VolumePricing) => {
        if (!acc.find(p => p.id === vp.product_id)) {
          acc.push({
            id: vp.product_id,
            name: vp.product_name,
            price: vp.base_price,
            stock_quantity: 0, // Will be updated separately
            category_name: vp.category_name,
            discount_percentage: vp.discount_percentage,
            b2b_price: vp.base_price * (1 - vp.discount_percentage / 100)
          })
        }
        return acc
      }, []) || []
      
      setProducts(uniqueProducts)
    } catch (error) {
      setError('Failed to load volume pricing')
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(products.map(p => p.category_name)))
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category_name === selectedCategory)
    : products

  const calculateSavings = (basePrice: number, discount: number) => {
    return basePrice * (discount / 100)
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
            Volume Pricing
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

        <div className="mb-8">
          <label className="block text-organic-secondary font-semibold mb-2">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const pricingTiers = volumePricing.filter(vp => vp.product_id === product.id)
              .sort((a, b) => a.min_quantity - b.min_quantity)
            
            return (
              <div key={product.id} className="card">
                <h3 className="text-lg font-semibold text-organic-primary mb-4">
                  {product.name}
                </h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular Price:</span>
                    <span className="font-medium">${product.price.toFixed(2)}</span>
                  </div>
                  
                  {product.b2b_price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">B2B Price:</span>
                      <span className="font-semibold text-organic-primary">
                        ${product.b2b_price.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {product.discount_percentage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Your Savings:</span>
                      <span className="font-semibold text-green-600">
                        ${calculateSavings(product.price, product.discount_percentage).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-organic-primary mb-3">
                    Volume Tiers
                  </h4>
                  
                  <div className="space-y-2">
                    {pricingTiers.length === 0 ? (
                      <p className="text-sm text-gray-600">
                        Standard B2B pricing applies
                      </p>
                    ) : (
                      pricingTiers.map((tier, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {tier.min_quantity}+{tier.max_quantity ? ` - ${tier.max_quantity}` : '+'} units
                          </span>
                          <span className="font-semibold text-organic-primary">
                            {tier.discount_percentage}% off
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/products?category=${product.category_name}`)}
                  className="w-full mt-4 btn-primary"
                >
                  View Product
                </button>
              </div>
            )
          })}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {selectedCategory ? 'No products found in this category.' : 'No volume pricing available.'}
            </p>
          </div>
        )}

        <div className="mt-12 card">
          <h2 className="text-xl font-semibold text-organic-primary mb-4">
            Volume Pricing Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-organic-primary mb-2">
                Save More
              </h3>
              <p className="text-sm text-gray-600">
                The more you buy, the more you save with automatic volume discounts.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold text-organic-primary mb-2">
                Predictable Pricing
              </h3>
              <p className="text-sm text-gray-600">
                Clear tier structure helps you plan your purchasing strategy.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-organic-primary mb-2">
                Quick Reordering
              </h3>
              <p className="text-sm text-gray-600">
                Save your favorite orders for fast repeat purchases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
