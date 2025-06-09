// Stripe Payment API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/station'

export interface PaymentIntent {
  clientSecret: string
  id: string
  amount: number
  currency: string
  status: string
}

export interface CreatePaymentIntentRequest {
  amount: number
  currency: string
  bookingId: string
  description?: string
}

export interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

export class PaymentAPI {
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getAuthToken()
    const url = `${API_BASE_URL}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Payment request failed' }))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Create payment intent for a booking
  static async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    return this.request('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Confirm payment completion
  static async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; payment: any }> {
    return this.request('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    })
  }

  // Get payment methods for user
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.request('/api/payments/methods')
  }

  // Get payment history
  static async getPaymentHistory(): Promise<any[]> {
    return this.request('/api/payments/history')
  }
}