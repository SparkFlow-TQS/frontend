"use client"

import React, { useState } from 'react'
import {
  useStripe,
  useElements,
  CardElement,
  PaymentElement
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaCreditCard, FaSpinner } from 'react-icons/fa'

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  bookingDetails?: {
    stationName: string
    date: string
    duration: string
  }
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  bookingDetails
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`,
        },
        redirect: 'if_required'
      })

      if (result.error) {
        setPaymentError(result.error.message || 'An error occurred during payment')
        onError(result.error.message || 'Payment failed')
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FaCreditCard className="h-5 w-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookingDetails && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Booking Summary</h3>
            <div className="text-gray-300 text-sm space-y-1">
              <div>Station: {bookingDetails.stationName}</div>
              <div>Date: {bookingDetails.date}</div>
              <div>Duration: {bookingDetails.duration}</div>
              <div className="text-[#FFA500] font-semibold text-lg mt-2">
                Total: €{(amount / 100).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-white/5 rounded-lg">
            <PaymentElement 
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: '',
                    email: ''
                  }
                }
              }}
            />
          </div>

          {paymentError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {paymentError}
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-[#FFA500] text-black hover:bg-[#FFA500]/90 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay €${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-gray-400 text-center">
          <div className="flex items-center justify-center gap-2">
            <span>🔒 Secured by Stripe</span>
          </div>
          <p className="mt-1">Your payment information is encrypted and secure</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Legacy card element form for backwards compatibility
export const LegacyStripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  bookingDetails
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card element not found')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (result.error) {
        setPaymentError(result.error.message || 'An error occurred during payment')
        onError(result.error.message || 'Payment failed')
      } else {
        onSuccess(result.paymentIntent)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FaCreditCard className="h-5 w-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookingDetails && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Booking Summary</h3>
            <div className="text-gray-300 text-sm space-y-1">
              <div>Station: {bookingDetails.stationName}</div>
              <div>Date: {bookingDetails.date}</div>
              <div>Duration: {bookingDetails.duration}</div>
              <div className="text-[#FFA500] font-semibold text-lg mt-2">
                Total: €{(amount / 100).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-white/5 rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>

          {paymentError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {paymentError}
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-[#FFA500] text-black hover:bg-[#FFA500]/90 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay €${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-gray-400 text-center">
          <div className="flex items-center justify-center gap-2">
            <span>🔒 Secured by Stripe</span>
          </div>
          <p className="mt-1">Your payment information is encrypted and secure</p>
        </div>
      </CardContent>
    </Card>
  )
}