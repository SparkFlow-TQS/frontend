"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FaCalendarAlt, FaBolt, FaClock, FaMapPin, FaTrash, FaFilter } from "react-icons/fa"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { ReservationManager } from "@/lib/reservations"
import { Reservation, ReservationDisplayStatus } from "@/types"
// import { useAuth } from "@/contexts/AuthContext"

export default function BookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = () => {
    setLoading(true)
    try {
      const allReservations = ReservationManager.getAllReservations()
      // Sort by creation date, newest first
      const sortedReservations = allReservations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setReservations(sortedReservations)
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReservation = (reservationId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const success = ReservationManager.deleteReservation(reservationId)
      if (success) {
        loadReservations() // Reload to reflect changes
      }
    }
  }

  const getStatusColor = (status: ReservationDisplayStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  }

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true
    if (filter === 'upcoming') {
      return reservation.timeSlot.start > new Date() && 
             ['pending', 'confirmed'].includes(reservation.displayStatus)
    }
    if (filter === 'completed') return reservation.displayStatus === 'completed'
    if (filter === 'cancelled') return reservation.displayStatus === 'cancelled'
    return true
  })

  const generateDemoData = () => {
    // Demo data generation would be implemented here
    loadReservations()
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all bookings? This action cannot be undone.')) {
      // Clear all functionality would be implemented here
      loadReservations()
    }
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
                <h1 className="text-3xl font-bold text-white">My Bookings</h1>
                <p className="text-gray-300 mt-2">Manage your charging station reservations</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateDemoData} className="text-white border-white">
                  Add Demo Data
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllData} className="text-white border-white">
                  Clear All
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { key: 'all', label: 'All Bookings' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={filter === tab.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(tab.key as 'all' | 'upcoming' | 'completed' | 'cancelled')}
                  className={filter === tab.key ? 
                    "bg-[#FFA500] text-black" : 
                    "text-white border-white hover:bg-white/10"
                  }
                >
                  <FaFilter className="mr-2 h-3 w-3" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFA500] mx-auto mb-4"></div>
                <p className="text-white">Loading your bookings...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredReservations.length === 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-12">
                  <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
                  <p className="text-gray-300 mb-6">
                    {filter === 'all' 
                      ? "You haven't made any charging station reservations yet."
                      : `No ${filter} bookings to display.`
                    }
                  </p>
                  <div className="space-x-3">
                    <Link href="/schedule">
                      <Button className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90">
                        Book a Charging Session
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={generateDemoData} className="text-white border-white">
                      Add Demo Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bookings List */}
            {!loading && filteredReservations.length > 0 && (
              <div className="grid gap-4">
                {filteredReservations.map((reservation) => (
                  <Card key={reservation.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-white">
                              {reservation.stationName}
                            </h3>
                            <Badge className={getStatusColor(reservation.displayStatus)}>
                              {reservation.displayStatus}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-gray-300">
                              <FaCalendarAlt className="h-4 w-4" />
                              <span>{formatDate(reservation.timeSlot.start)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-300">
                              <FaClock className="h-4 w-4" />
                              <span>
                                {formatTime(reservation.timeSlot.start)} - {formatTime(reservation.timeSlot.end)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-300">
                              <FaBolt className="h-4 w-4" />
                              <span>{reservation.chargerCount || 1} charger(s)</span>
                            </div>
                          </div>

                          {reservation.estimatedCost && (
                            <div className="mt-3">
                              <span className="text-sm text-gray-400">Estimated Cost: </span>
                              <span className="font-semibold text-[#FFA500]">
                                €{reservation.estimatedCost.toFixed(2)}
                              </span>
                            </div>
                          )}

                          {reservation.recurringDays && reservation.recurringDays.size > 0 && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-purple-300 border-purple-300">
                                Recurring
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {reservation.displayStatus !== 'cancelled' && 
                           reservation.displayStatus !== 'completed' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReservation(reservation.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <FaTrash className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                          
                          <Link href={`/stations/${reservation.stationId}`}>
                            <Button variant="outline" size="sm" className="text-white border-white">
                              <FaMapPin className="h-3 w-3 mr-1" />
                              View Station
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 text-center">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="flex justify-center gap-4">
                    <Link href="/schedule">
                      <Button className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90">
                        <FaCalendarAlt className="mr-2 h-4 w-4" />
                        New Booking
                      </Button>
                    </Link>
                    <Link href="/map">
                      <Button variant="outline" className="text-white border-white">
                        <FaMapPin className="mr-2 h-4 w-4" />
                        Find Stations
                      </Button>
                    </Link>
                    <Link href="/history">
                      <Button variant="outline" className="text-white border-white">
                        <FaClock className="mr-2 h-4 w-4" />
                        View History
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}