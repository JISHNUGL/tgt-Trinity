'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  stock_quantity: number
  image_url?: string
  is_organic: boolean
  category_name?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, currentPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      setProducts(data.products || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'fresh-produce', label: 'Fresh Produce' },
    { value: 'dairy-products', label: 'Dairy Products' },
    { value: 'grains-cereals', label: 'Grains & Cereals' },
    { value: 'herbs-spices', label: 'Herbs & Spices' }
  ]

  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-8">
          Our Organic Products
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="input-field"
            />
          </div>
          
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-organic-secondary mb-4">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-organic-primary text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-organic-secondary transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-organic-secondary">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-organic-primary text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-organic-secondary transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
