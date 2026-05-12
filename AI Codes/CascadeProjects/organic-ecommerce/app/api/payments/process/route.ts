import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { createPaymentService, PaymentData } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const body = await request.json()
    
    const {
      orderId,
      paymentMethod,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName,
      billingAddress,
      saveCard
    } = body

    if (!orderId || !paymentMethod || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      )
    }

    const orders = await query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, decoded.userId]
    )

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orders[0] as any

    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      )
    }

    const paymentData: PaymentData = {
      orderId: order.order_number,
      amount: parseFloat(order.total_amount),
      currency: 'CAD',
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryMonth: expiryMonth.padStart(2, '0'),
      expiryYear: expiryYear,
      cvv: cvv,
      cardholderName: cardholderName.trim(),
      billingAddress: billingAddress ? {
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        zipCode: billingAddress.zipCode,
        country: billingAddress.country || 'CA'
      } : undefined
    }

    const useMock = process.env.NODE_ENV !== 'production'
    const paymentService = createPaymentService(useMock)
    
    const paymentResult = await paymentService.processPayment(paymentData)

    if (paymentResult.success) {
      await query(
        'UPDATE orders SET payment_status = ?, payment_method = ?, transaction_id = ?, updated_at = NOW() WHERE id = ?',
        ['paid', paymentMethod, paymentResult.transactionId, orderId]
      )

      await query(
        'INSERT INTO payment_transactions (order_id, transaction_id, amount, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [orderId, paymentResult.transactionId, order.total_amount, paymentMethod, 'completed']
      )

      if (saveCard && billingAddress) {
        const existingCard = await query(
          'SELECT id FROM saved_cards WHERE user_id = ? AND card_number_hash = ?',
          [decoded.userId, cardNumber.slice(-4)]
        )

        if (!Array.isArray(existingCard) || existingCard.length === 0) {
          await query(
            'INSERT INTO saved_cards (user_id, card_number_hash, cardholder_name, expiry_month, expiry_year, billing_address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [decoded.userId, cardNumber.slice(-4), cardholderName, expiryMonth, expiryYear, JSON.stringify(billingAddress)]
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: paymentResult.transactionId,
        authorizationCode: paymentResult.authorizationCode,
        receiptUrl: paymentResult.receiptUrl
      })
    } else {
      await query(
        'UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?',
        ['failed', orderId]
      )

      await query(
        'INSERT INTO payment_transactions (order_id, amount, payment_method, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [orderId, order.total_amount, paymentMethod, 'failed', paymentResult.errorMessage]
      )

      return NextResponse.json(
        {
          success: false,
          error: paymentResult.errorMessage || 'Payment failed',
          errorCode: paymentResult.errorCode
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
