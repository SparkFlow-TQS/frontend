"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaCreditCard, FaDollarSign, FaDownload, FaPlus, FaTrash } from "react-icons/fa"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
// import { useAuth } from "@/contexts/AuthContext"

interface PaymentMethod {
  id: string
  type: 'credit' | 'debit' | 'paypal'
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

interface Transaction {
  id: string
  date: Date
  amount: number
  status: 'completed' | 'pending' | 'failed'
  description: string
  stationName: string
  paymentMethod: string
}

export default function PaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = () => {
    // Load demo payment methods
    const demoPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'credit',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      },
      {
        id: '2',
        type: 'debit',
        last4: '5555',
        brand: 'Mastercard',
        expiryMonth: 8,
        expiryYear: 2026,
        isDefault: false
      }
    ]

    // Load demo transactions
    const demoTransactions: Transaction[] = [
      {
        id: '1',
        date: new Date('2024-06-08'),
        amount: 25.50,
        status: 'completed',
        description: 'Charging session - 2h 30m',
        stationName: 'Central Station',
        paymentMethod: 'Visa •••• 4242'
      },
      {
        id: '2',
        date: new Date('2024-06-05'),
        amount: 18.75,
        status: 'completed',
        description: 'Charging session - 1h 45m',
        stationName: 'Mall Parking',
        paymentMethod: 'Mastercard •••• 5555'
      },
      {
        id: '3',
        date: new Date('2024-06-03'),
        amount: 32.00,
        status: 'pending',
        description: 'Charging session - 3h 00m',
        stationName: 'Airport Terminal',
        paymentMethod: 'Visa •••• 4242'
      }
    ]

    setPaymentMethods(demoPaymentMethods)
    setTransactions(demoTransactions)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCardIcon = () => {
    return <FaCreditCard className="h-4 w-4" />
  }

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would integrate with a payment processor
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'credit',
      last4: cardForm.number.slice(-4),
      brand: 'Visa', // Would be determined by card number
      expiryMonth: parseInt(cardForm.expiry.split('/')[0]),
      expiryYear: parseInt('20' + cardForm.expiry.split('/')[1]),
      isDefault: paymentMethods.length === 0
    }
    
    setPaymentMethods([...paymentMethods, newCard])
    setShowAddCard(false)
    setCardForm({ number: '', expiry: '', cvc: '', name: '' })
  }

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(paymentMethods.filter(card => card.id !== cardId))
    }
  }

  const handleSetDefault = (cardId: string) => {
    setPaymentMethods(paymentMethods.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })))
  }

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Description', 'Station', 'Amount', 'Status', 'Payment Method'].join(','),
      ...transactions.map(t => [
        formatDate(t.date),
        t.description,
        t.stationName,
        t.amount.toFixed(2),
        t.status,
        t.paymentMethod
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col w-screen overflow-hidden">
        <header>
          <Navbar />
        </header>
        <main className="flex-1 bg-[#14213d] p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Payment Methods & Billing</h1>
                <p className="text-gray-300 mt-2">Manage your payment methods and view transaction history</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportTransactions}
                className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
              >
                <FaDownload className="mr-2 h-3 w-3" />
                Export Transactions
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
                  <Button 
                    onClick={() => setShowAddCard(true)}
                    className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90"
                  >
                    <FaPlus className="mr-2 h-3 w-3" />
                    Add Card
                  </Button>
                </div>

                {paymentMethods.length === 0 ? (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="text-center py-8">
                      <FaCreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No payment methods</h3>
                      <p className="text-gray-300 mb-4">Add a payment method to start charging</p>
                      <Button 
                        onClick={() => setShowAddCard(true)}
                        className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90"
                      >
                        Add Your First Card
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((card) => (
                      <Card key={card.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              {getCardIcon()}
                              <div>
                                <div className="text-white font-medium">
                                  {card.brand} •••• {card.last4}
                                  {card.isDefault && (
                                    <Badge className="ml-2 bg-[#FFA500] text-black">Default</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-300">
                                  Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {!card.isDefault && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefault(card.id)}
                                  className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCard(card.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <FaTrash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Add Card Form */}
                {showAddCard && (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
                    <CardHeader>
                      <CardTitle className="text-white">Add New Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddCard} className="space-y-4">
                        <div>
                          <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardForm.number}
                            onChange={(e) => setCardForm({...cardForm, number: e.target.value})}
                            className="bg-white/20 border-white/30 text-white"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry" className="text-white">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={cardForm.expiry}
                              onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})}
                              className="bg-white/20 border-white/30 text-white"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvc" className="text-white">CVC</Label>
                            <Input
                              id="cvc"
                              placeholder="123"
                              value={cardForm.cvc}
                              onChange={(e) => setCardForm({...cardForm, cvc: e.target.value})}
                              className="bg-white/20 border-white/30 text-white"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cardName" className="text-white">Cardholder Name</Label>
                          <Input
                            id="cardName"
                            placeholder="John Doe"
                            value={cardForm.name}
                            onChange={(e) => setCardForm({...cardForm, name: e.target.value})}
                            className="bg-white/20 border-white/30 text-white"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90">
                            Add Card
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowAddCard(false)}
                            className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Transactions */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
                
                {transactions.length === 0 ? (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="text-center py-8">
                      <FaDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
                      <p className="text-gray-300">Your charging transactions will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <Card key={transaction.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-medium">{transaction.stationName}</h3>
                                <Badge className={getStatusColor(transaction.status)}>
                                  {transaction.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-300 mb-1">{transaction.description}</p>
                              <p className="text-xs text-gray-400">{transaction.paymentMethod}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-white">
                                €{transaction.amount.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(transaction.date)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Billing Summary */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Billing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFA500]">
                      €{transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-300">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFA500]">
                      {transactions.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-300">Completed Payments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFA500]">
                      €{(transactions.reduce((sum, t) => sum + t.amount, 0) / Math.max(transactions.length, 1)).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-300">Average Per Session</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}