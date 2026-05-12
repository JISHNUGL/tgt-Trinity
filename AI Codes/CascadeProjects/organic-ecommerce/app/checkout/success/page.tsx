'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-organic-white flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="card text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-organic-primary mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-organic-secondary mb-2">
            Thank you for your order.
          </p>
          {orderId && (
            <p className="text-gray-600 mb-6">
              Order ID: <span className="font-semibold text-organic-primary">#{orderId}</span>
            </p>
          )}
          
          <div className="bg-organic-accent/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-organic-secondary">
              You&apos;ll receive a confirmation email shortly with your order details and tracking information.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders" className="btn-primary">
              View My Orders
            </Link>
            <Link href="/products" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-organic-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
