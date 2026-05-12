'use client'

import { mockProducts } from '@/lib/mockData'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const product = mockProducts.find(p => p.slug === params.slug)

  if (!product) {
    return (
      <div className="min-h-screen bg-organic-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-organic-primary mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <button onClick={() => router.push('/products')} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image_url: product.image_url
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/products')}
          className="text-organic-primary hover:text-organic-secondary transition-colors mb-6 inline-flex items-center"
        >
          ← Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-organic-accent/20 rounded-2xl flex items-center justify-center aspect-square">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-8xl">🌱</span>
            )}
          </div>

          <div>
            {product.category_name && (
              <span className="text-xs text-organic-muted uppercase tracking-wide font-semibold">
                {product.category_name}
              </span>
            )}
            <h1 className="text-3xl font-bold text-organic-primary mt-2 mb-4">
              {product.name}
            </h1>

            {product.is_organic && (
              <div className="inline-flex items-center bg-organic-accent text-organic-secondary px-3 py-1 rounded-full text-sm font-semibold mb-4">
                🌿 Certified Organic
              </div>
            )}

            <p className="text-gray-600 text-lg mb-6">
              {product.description}
            </p>

            <div className="text-3xl font-bold text-organic-primary mb-6">
              ${product.price.toFixed(2)}
            </div>

            <div className="mb-6">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 font-medium">
                  ✅ In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-red-600 font-medium">❌ Out of Stock</span>
              )}
            </div>

            {product.stock_quantity > 0 && (
              <div className="flex items-center space-x-4 mb-6">
                <label className="font-semibold text-organic-secondary">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full bg-organic-muted text-white hover:bg-organic-primary transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    className="w-10 h-10 rounded-full bg-organic-muted text-white hover:bg-organic-primary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={addToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addedToCart ? '✓ Added to Cart!' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="btn-secondary"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
