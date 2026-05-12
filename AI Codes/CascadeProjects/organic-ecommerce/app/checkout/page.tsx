'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface OrderData {
  items: CartItem[]
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [orderData, setOrderData] = useState<Partial<OrderData>>({})
  const router = useRouter()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(cart)
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    setOrderData({
      ...orderData,
      shippingAddress: {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string,
        country: formData.get('country') as string
      }
    })
    setStep(2)
  }

  const handlePaymentSubmit = async (e: any) => {
    e.preventDefault()
    setProcessing(true)
    setError('')

    try {
      const formData = new FormData(e.target)
      
      const paymentData = {
        orderId: `ORDER_${Date.now()}`,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        shippingAddress: JSON.stringify(orderData.shippingAddress),
        billingAddress: orderData.billingAddress ? JSON.stringify(orderData.billingAddress) : JSON.stringify(orderData.shippingAddress),
        paymentMethod: 'credit_card',
        notes: formData.get('notes') as string
      }

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const orderResult = await orderResponse.json()

      const paymentResponse = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderResult.order.id,
          paymentMethod: 'credit_card',
          cardNumber: formData.get('cardNumber') as string,
          expiryMonth: formData.get('expiryMonth') as string,
          expiryYear: formData.get('expiryYear') as string,
          cvv: formData.get('cvv') as string,
          cardholderName: formData.get('cardholderName') as string,
          billingAddress: orderData.billingAddress || orderData.shippingAddress,
          saveCard: formData.get('saveCard') === 'on'
        })
      })

      const paymentResult = await paymentResponse.json()

      if (paymentResult.success) {
        localStorage.removeItem('cart')
        router.push(`/checkout/success?orderId=${orderResult.order.id}`)
      } else {
        setError(paymentResult.error || 'Payment failed')
      }
    } catch (error) {
      setError('An error occurred during checkout')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-organic-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-organic-white flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl text-organic-secondary mb-4">Your cart is empty</h3>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-8">
          Checkout
        </h1>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-organic-primary text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-organic-primary' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-organic-primary text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="card">
                <h2 className="text-2xl font-semibold text-organic-primary mb-6">
                  Shipping Information
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Country
                      </label>
                      <select name="country" required className="input-field">
                        <option value="CA">Canada</option>
                        <option value="US">United States</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="card">
                <h2 className="text-2xl font-semibold text-organic-primary mb-6">
                  Payment Information
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      required
                      className="input-field"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Expiry Month
                      </label>
                      <select name="expiryMonth" required className="input-field">
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                            {(i + 1).toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Expiry Year
                      </label>
                      <select name="expiryYear" required className="input-field">
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i + new Date().getFullYear()} value={i + new Date().getFullYear()}>
                            {i + new Date().getFullYear()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        placeholder="123"
                        required
                        className="input-field"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardholderName"
                      placeholder="John Doe"
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      className="input-field"
                      rows={3}
                      placeholder="Any special instructions..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="saveCard"
                      id="saveCard"
                      className="mr-2"
                    />
                    <label htmlFor="saveCard" className="text-organic-secondary">
                      Save card for future purchases
                    </label>
                  </div>

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                      disabled={processing}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-organic-primary mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-organic-primary">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shipping === 0 && subtotal > 0 && (
                <div className="bg-organic-accent/20 p-3 rounded-lg mb-4">
                  <p className="text-sm text-organic-secondary">
                    🎉 You qualify for free shipping!
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold text-organic-primary mb-3">Order Items</h3>
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
