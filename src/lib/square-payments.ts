// Square Payments Integration for Live Vibe
// Using Square Sandbox for development

interface SquarePaymentRequest {
  amount: number // Amount in cents
  currency: string
  source_id: string // Payment token from Square Web Payments SDK
  idempotency_key: string
  location_id?: string
  reference_id?: string
  note?: string
  buyer_email_address?: string
}

interface SquarePaymentResponse {
  payment: {
    id: string
    status: string
    amount_money: {
      amount: number
      currency: string
    }
    source_type: string
    card_details?: {
      status: string
      card: {
        card_brand: string
        last_4: string
      }
    }
    receipt_number: string
    receipt_url: string
  }
}

interface SquareSubscriptionRequest {
  plan_id: string
  card_token: string
  customer_id?: string
  start_date?: string
}

const SQUARE_APPLICATION_ID = 'sandbox-sq0idb-mp3Vflxf9Dk8awkEmHrxLw'
const SQUARE_ACCESS_TOKEN = 'EAAAl2LU9yWLbbcgH3rKZo9NJO7A1BAh90PD7JvLI42uGcYnovBYKwgO1cMBtjXT'
const SQUARE_ENVIRONMENT = 'sandbox' // Change to 'production' for live
const SQUARE_LOCATION_ID = 'main' // Default location

// Square API Base URL
const SQUARE_API_BASE = SQUARE_ENVIRONMENT === 'sandbox' 
  ? 'https://connect.squareupsandbox.com'
  : 'https://connect.squareup.com'

class SquarePayments {
  private accessToken: string
  private applicationId: string
  private environment: string

  constructor() {
    this.accessToken = SQUARE_ACCESS_TOKEN
    this.applicationId = SQUARE_APPLICATION_ID
    this.environment = SQUARE_ENVIRONMENT
  }

  // Initialize Square Web Payments SDK
  async initializePaymentForm(containerId: string, callbacks: {
    onPaymentSuccess: (result: any) => void
    onPaymentError: (error: any) => void
  }) {
    // Load Square Web Payments SDK
    if (!window.Square) {
      await this.loadSquareSDK()
    }

    const payments = window.Square.payments(this.applicationId, SQUARE_LOCATION_ID)
    
    try {
      const card = await payments.card()
      await card.attach(`#${containerId}`)

      return {
        card,
        tokenize: async () => {
          const result = await card.tokenize()
          if (result.status === 'OK') {
            return result.token
          } else {
            throw new Error(result.errors?.[0]?.message || 'Tokenization failed')
          }
        }
      }
    } catch (error) {
      console.error('Square payment form initialization failed:', error)
      throw error
    }
  }

  // Load Square Web Payments SDK
  private loadSquareSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Square) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Square SDK'))
      document.head.appendChild(script)
    })
  }

  // Process a one-time payment
  async processPayment(paymentData: SquarePaymentRequest): Promise<SquarePaymentResponse> {
    try {
      const response = await fetch(`${SQUARE_API_BASE}/v2/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18'
        },
        body: JSON.stringify({
          source_id: paymentData.source_id,
          idempotency_key: paymentData.idempotency_key,
          amount_money: {
            amount: paymentData.amount,
            currency: paymentData.currency
          },
          location_id: SQUARE_LOCATION_ID,
          reference_id: paymentData.reference_id,
          note: paymentData.note,
          buyer_email_address: paymentData.buyer_email_address
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.detail || 'Payment failed')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Square payment processing failed:', error)
      throw error
    }
  }

  // Create a customer for subscriptions
  async createCustomer(customerData: {
    given_name?: string
    family_name?: string
    email_address?: string
    phone_number?: string
  }) {
    try {
      const response = await fetch(`${SQUARE_API_BASE}/v2/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18'
        },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.detail || 'Customer creation failed')
      }

      const result = await response.json()
      return result.customer
    } catch (error) {
      console.error('Square customer creation failed:', error)
      throw error
    }
  }

  // Create a subscription
  async createSubscription(subscriptionData: {
    location_id: string
    plan_id: string
    customer_id: string
    card_id: string
    start_date?: string
  }) {
    try {
      const response = await fetch(`${SQUARE_API_BASE}/v2/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18'
        },
        body: JSON.stringify({
          location_id: subscriptionData.location_id,
          plan_id: subscriptionData.plan_id,
          customer_id: subscriptionData.customer_id,
          card_id: subscriptionData.card_id,
          start_date: subscriptionData.start_date
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.detail || 'Subscription creation failed')
      }

      const result = await response.json()
      return result.subscription
    } catch (error) {
      console.error('Square subscription creation failed:', error)
      throw error
    }
  }

  // Generate idempotency key for payments
  generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Format amount for Square (convert dollars to cents)
  formatAmount(dollars: number): number {
    return Math.round(dollars * 100)
  }

  // Format amount for display (convert cents to dollars)
  formatDisplayAmount(cents: number): string {
    return (cents / 100).toFixed(2)
  }
}

// Global Square types
declare global {
  interface Window {
    Square: any
  }
}

export const squarePayments = new SquarePayments()
export type { SquarePaymentRequest, SquarePaymentResponse }