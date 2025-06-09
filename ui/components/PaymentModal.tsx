"use client"

import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { StripePaymentForm } from './StripePaymentForm'
import { PaymentAPI, CreatePaymentIntentRequest } from '@/lib/payment-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  amount: number // amount in cents
  currency?: string
  bookingDetails: {
    stationName: string
    date: string
    duration: string
  }
  onPaymentSuccess: (paymentIntent: any) => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  amount,
  currency = 'eur',
  bookingDetails,
  onPaymentSuccess
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (isOpen && !clientSecret) {
      createPaymentIntent()
    }
  }, [isOpen, clientSecret])

  const createPaymentIntent = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const request: CreatePaymentIntentRequest = {
        amount,
        currency,
        bookingId,
        description: `Charging session at ${bookingDetails.stationName}`
      }
      
      const paymentIntent = await PaymentAPI.createPaymentIntent(request)
      setClientSecret(paymentIntent.clientSecret)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setPaymentStatus('success')
    
    try {
      // Confirm payment on backend
      await PaymentAPI.confirmPayment(paymentIntent.id)
      
      // Notify parent component
      onPaymentSuccess(paymentIntent)
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose()
        resetModal()
      }, 2000)
    } catch (err) {
      console.error('Error confirming payment:', err)
      // Even if backend confirmation fails, the payment succeeded on Stripe
      onPaymentSuccess(paymentIntent)
      setTimeout(() => {
        onClose()
        resetModal()
      }, 2000)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    setPaymentStatus('error')
  }

  const resetModal = () => {
    setClientSecret(null)
    setError(null)
    setPaymentStatus('idle')
    setLoading(false)
  }

  const handleClose = () => {
    onClose()
    resetModal()
  }

  if (!isOpen) return null

  const stripeOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#FFA500',
        colorBackground: '#1e293b',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14213d] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Complete Payment</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <FaSpinner className="h-8 w-8 animate-spin text-[#FFA500] mx-auto mb-4" />
              <p className="text-white">Preparing payment...</p>
            </div>
          )}

          {error && !loading && (
            <Card className="bg-red-500/20 border-red-500/50">
              <CardContent className="p-4 text-center">
                <FaExclamationTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-300 mb-4">{error}</p>
                <Button
                  onClick={createPaymentIntent}
                  className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {paymentStatus === 'success' && (
            <Card className="bg-green-500/20 border-green-500/50">
              <CardContent className="p-6 text-center">
                <FaCheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Payment Successful!</h3>
                <p className="text-green-300">Your booking has been confirmed.</p>
              </CardContent>
            </Card>
          )}

          {clientSecret && paymentStatus === 'idle' && (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                bookingDetails={bookingDetails}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}