'use client'

import Link from 'next/link'
import { useState } from 'react'

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
  b2b_price?: number
  discount_percentage?: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}
  const isB2B = user.role === 'b2b' && user.b2bApproved

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: isB2B && product.b2b_price ? product.b2b_price : product.price,
        quantity: 1,
        image_url: product.image_url
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <div 
      className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden rounded-t-lg">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover transition-transform duration-300"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            />
          ) : (
            <div className="w-full h-48 bg-organic-accent/20 flex items-center justify-center">
              <span className="text-organic-muted text-4xl">🌱</span>
            </div>
          )}
          
          {product.is_organic && (
            <div className="absolute top-2 right-2 bg-organic-accent text-organic-secondary px-2 py-1 rounded-full text-xs font-semibold">
              Organic
            </div>
          )}
          
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Only {product.stock_quantity} left
            </div>
          )}
          
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            {product.category_name && (
              <span className="text-xs text-organic-muted uppercase tracking-wide">
                {product.category_name}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-organic-primary mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-organic-primary">
                ${isB2B && product.b2b_price ? product.b2b_price.toFixed(2) : product.price.toFixed(2)}
              </div>
              {isB2B && product.b2b_price && product.discount_percentage && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    Save {product.discount_percentage}%
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (product.stock_quantity > 0) {
                  addToCart()
                }
              }}
              disabled={product.stock_quantity === 0}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                product.stock_quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-organic-primary text-white hover:bg-organic-secondary'
              }`}
            >
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}
