"use client"

import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaBolt, FaClock, FaTrash, FaCheck, FaSync } from 'react-icons/fa'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Reservation, ReservationDisplayStatus, formatRecurringDays } from '@/types'
import { ReservationManager } from '@/lib/reservations'
import { BookingService } from '@/lib/bookingService'
import { useAuth } from '@/contexts/AuthContext'

export default function ReservationDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [useApi, setUseApi] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadReservations()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, useApi])

  const loadReservations = async () => {
    setLoading(true)
    try {
      if (useApi && user?.id) {
        // Try to load from API first
        const apiReservations = await BookingService.getAllReservations(parseInt(user.id))
        setReservations(apiReservations)
      } else {
        // Fallback to localStorage
        const allReservations = ReservationManager.getAllReservations()
        // Sort by creation date, newest first
        const sortedReservations = allReservations.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setReservations(sortedReservations)
      }
    } catch (error) {
      console.error('Error loading reservations:', error)
      // Fallback to localStorage on API error
      if (useApi) {
        console.log('Falling back to localStorage...')
        setUseApi(false)
        const allReservations = ReservationManager.getAllReservations()
        const sortedReservations = allReservations.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setReservations(sortedReservations)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reservationId: string, newStatus: ReservationDisplayStatus) => {
    try {
      if (useApi && user?.id) {
        const success = await BookingService.updateReservationStatus()
        if (success) {
          loadReservations() // Reload to reflect changes
        } else {
          console.warn('API status update not implemented, falling back to localStorage')
          const success = ReservationManager.updateReservationStatus(reservationId, newStatus)
          if (success) {
            loadReservations()
          }
        }
      } else {
        const success = ReservationManager.updateReservationStatus(reservationId, newStatus)
        if (success) {
          loadReservations() // Reload to reflect changes
        }
      }
    } catch (error) {
      console.error('Error updating reservation status:', error)
    }
  }

  const handleDeleteReservation = async (reservationId: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        if (useApi && user?.id) {
          const success = await BookingService.cancelReservation(reservationId)
          if (success) {
            loadReservations() // Reload to reflect changes
          }
        } else {
          const success = ReservationManager.deleteReservation(reservationId)
          if (success) {
            loadReservations() // Reload to reflect changes
          }
        }
      } catch (error) {
        console.error('Error cancelling reservation:', error)
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

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getDuration = (start: Date, end: Date) => {
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return `${hours}h`
  }

  const getUpcomingReservations = () => {
    return reservations.filter(r => 
      r.timeSlot.start > new Date() && r.displayStatus !== 'cancelled'
    )
  }

  const getPastReservations = () => {
    return reservations.filter(r => 
      r.timeSlot.end < new Date() || r.displayStatus === 'cancelled' || r.displayStatus === 'completed'
    )
  }

  // Demo data generator for testing
  const generateDemoData = () => {
    ReservationManager.generateDemoReservations(1, "Demo Station")
    loadReservations()
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all reservations? This cannot be undone.')) {
      ReservationManager.clearAllReservations()
      loadReservations()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14213d]"></div>
      </div>
    )
  }

  const upcomingReservations = getUpcomingReservations()
  const pastReservations = getPastReservations()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#14213d]">My Reservations</h2>
          <p className="text-sm text-gray-600">
            {useApi ? 
              (user?.id ? 'Loading from Station Service API' : 'API mode (not authenticated)') : 
              'Loading from local storage'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUseApi(!useApi)}
            className={useApi ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}
          >
            {useApi ? 'Switch to Local' : 'Switch to API'}
          </Button>
          <Button variant="outline" size="sm" onClick={generateDemoData}>
            Add Demo Data
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllData}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{reservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FaClock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingReservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FaCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => r.displayStatus === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FaBolt className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">
                  €{reservations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Reservations</h3>
          <div className="space-y-4">
            {upcomingReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{reservation.stationName}</h4>
                        <Badge className={getStatusColor(reservation.displayStatus)}>
                          {reservation.displayStatus}
                        </Badge>
                        {reservation.recurringDays && reservation.recurringDays.size > 0 && (
                          <Badge variant="outline" className="text-purple-600 border-purple-600">
                            <FaSync className="h-3 w-3 mr-1" />
                            {formatRecurringDays(reservation.recurringDays)}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><FaCalendarAlt className="inline mr-1" /> 
                            {formatDateTime(reservation.timeSlot.start)}
                          </p>
                          <p><FaClock className="inline mr-1" /> 
                            {getDuration(reservation.timeSlot.start, reservation.timeSlot.end)}
                          </p>
                        </div>
                        <div>
                          <p><FaBolt className="inline mr-1" /> 
                            {reservation.chargerCount} charger{reservation.chargerCount > 1 ? 's' : ''}
                          </p>
                          {reservation.estimatedCost && (
                            <p>💰 €{reservation.estimatedCost.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {reservation.displayStatus === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                        >
                          <FaCheck className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Reservations */}
      {pastReservations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Past Reservations</h3>
          <div className="space-y-4">
            {pastReservations.slice(0, 5).map((reservation) => (
              <Card key={reservation.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{reservation.stationName}</h4>
                        <Badge className={getStatusColor(reservation.displayStatus)}>
                          {reservation.displayStatus}
                        </Badge>
                        {reservation.recurringDays && reservation.recurringDays.size > 0 && (
                          <Badge variant="outline" className="text-purple-600 border-purple-600">
                            <FaSync className="h-3 w-3 mr-1" />
                            {formatRecurringDays(reservation.recurringDays)}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><FaCalendarAlt className="inline mr-1" /> 
                            {formatDateTime(reservation.timeSlot.start)}
                          </p>
                          <p><FaClock className="inline mr-1" /> 
                            {getDuration(reservation.timeSlot.start, reservation.timeSlot.end)}
                          </p>
                        </div>
                        <div>
                          <p><FaBolt className="inline mr-1" /> 
                            {reservation.chargerCount} charger{reservation.chargerCount > 1 ? 's' : ''}
                          </p>
                          {reservation.estimatedCost && (
                            <p>💰 €{reservation.estimatedCost.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {reservations.length === 0 && (
        <div className="text-center py-12">
          <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations yet</h3>
          <p className="text-gray-500 mb-4">Start by booking a charging session at a station.</p>
          <Button onClick={generateDemoData}>
            Add Demo Data
          </Button>
        </div>
      )}
    </div>
  )
} 