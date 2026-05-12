export interface PaymentProvider {
  processPayment(paymentData: PaymentData): Promise<PaymentResult>
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>
  validatePayment(paymentData: PaymentData): ValidationResult
}

export interface PaymentData {
  orderId: string
  amount: number
  currency: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  billingAddress?: BillingAddress
}

export interface BillingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  authorizationCode?: string
  errorMessage?: string
  errorCode?: string
  receiptUrl?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  errorMessage?: string
  errorCode?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class MonerisProvider implements PaymentProvider {
  private apiKey: string
  private storeId: string
  private environment: 'test' | 'production'

  constructor(apiKey: string, storeId: string, environment: 'test' | 'production' = 'test') {
    this.apiKey = apiKey
    this.storeId = storeId
    this.environment = environment
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const validation = this.validatePayment(paymentData)
      if (!validation.isValid) {
        return {
          success: false,
          errorMessage: validation.errors.join(', ')
        }
      }

      const endpoint = this.environment === 'test' 
        ? 'https://esqa.moneris.com/mpg/api/v2'
        : 'https://www3.moneris.com/mpg/api/v2'

      const monerisData = {
        store_id: this.storeId,
        api_token: this.apiKey,
        checkoutid: paymentData.orderId,
        txntotal: paymentData.amount.toString(),
        txnnumber: '1',
        custid: paymentData.orderId,
        language: 'eng',
        dynamic_descriptor: 'Organic E-commerce',
        cc_number: paymentData.cardNumber,
        cc_exp: `${paymentData.expiryMonth}${paymentData.expiryYear.slice(-2)}`,
        cvd_value: paymentData.cvv,
        commcard_invoice: paymentData.orderId,
        commcard_tax_amount: '0.00'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(monerisData)
      })

      const result = await response.json()

      if (result.ResponseCode === '027' || result.ResponseCode === '001') {
        return {
          success: true,
          transactionId: result.TransID,
          authorizationCode: result.AuthCode,
          receiptUrl: result.Receipt
        }
      } else {
        return {
          success: false,
          errorMessage: result.Message || 'Payment failed',
          errorCode: result.ResponseCode
        }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: 'Payment processing error',
        errorCode: 'NETWORK_ERROR'
      }
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
    try {
      const endpoint = this.environment === 'test' 
        ? 'https://esqa.moneris.com/mpg/api/v2'
        : 'https://www3.moneris.com/mpg/api/v2'

      const refundData = {
        store_id: this.storeId,
        api_token: this.apiKey,
        txnnumber: '1',
        order_no: transactionId,
        amount: amount?.toString() || '',
        dynamic_descriptor: 'Organic E-commerce Refund'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundData)
      })

      const result = await response.json()

      if (result.ResponseCode === '027' || result.ResponseCode === '001') {
        return {
          success: true,
          refundId: result.TransID
        }
      } else {
        return {
          success: false,
          errorMessage: result.Message || 'Refund failed',
          errorCode: result.ResponseCode
        }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: 'Refund processing error',
        errorCode: 'NETWORK_ERROR'
      }
    }
  }

  validatePayment(paymentData: PaymentData): ValidationResult {
    const errors: string[] = []

    if (!paymentData.cardNumber || paymentData.cardNumber.length < 13 || paymentData.cardNumber.length > 19) {
      errors.push('Invalid card number')
    }

    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      errors.push('Invalid expiry date')
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3 || paymentData.cvv.length > 4) {
      errors.push('Invalid CVV')
    }

    if (!paymentData.cardholderName || paymentData.cardholderName.trim().length < 2) {
      errors.push('Invalid cardholder name')
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid amount')
    }

    if (!paymentData.orderId) {
      errors.push('Invalid order ID')
    }

    const currentDate = new Date()
    const expiryDate = new Date(
      parseInt(paymentData.expiryYear),
      parseInt(paymentData.expiryMonth) - 1,
      1
    )

    if (expiryDate < currentDate) {
      errors.push('Card has expired')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export class MockPaymentProvider implements PaymentProvider {
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    const validation = this.validatePayment(paymentData)
    if (!validation.isValid) {
      return {
        success: false,
        errorMessage: validation.errors.join(', ')
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    if (paymentData.cardNumber.endsWith('0000')) {
      return {
        success: false,
        errorMessage: 'Card declined',
        errorCode: 'DECLINED'
      }
    }

    return {
      success: true,
      transactionId: `MOCK_${Date.now()}`,
      authorizationCode: `AUTH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      receiptUrl: 'https://example.com/receipt'
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      success: true,
      refundId: `REFUND_${Date.now()}`
    }
  }

  validatePayment(paymentData: PaymentData): ValidationResult {
    const errors: string[] = []

    if (!paymentData.cardNumber || paymentData.cardNumber.length < 13 || paymentData.cardNumber.length > 19) {
      errors.push('Invalid card number')
    }

    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      errors.push('Invalid expiry date')
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3 || paymentData.cvv.length > 4) {
      errors.push('Invalid CVV')
    }

    if (!paymentData.cardholderName || paymentData.cardholderName.trim().length < 2) {
      errors.push('Invalid cardholder name')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export class PaymentService {
  private provider: PaymentProvider

  constructor(provider: PaymentProvider) {
    this.provider = provider
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    return this.provider.processPayment(paymentData)
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
    return this.provider.refundPayment(transactionId, amount)
  }

  switchProvider(provider: PaymentProvider) {
    this.provider = provider
  }
}

export function createPaymentService(useMock: boolean = false): PaymentService {
  if (useMock) {
    return new PaymentService(new MockPaymentProvider())
  }

  const apiKey = process.env.MONERIS_API_KEY || ''
  const storeId = process.env.MONERIS_STORE_ID || ''
  const environment = (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production'

  return new PaymentService(new MonerisProvider(apiKey, storeId, environment))
}
