"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FaClock, FaBolt, FaCalendarAlt, FaDollarSign, FaDownload } from "react-icons/fa"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { ReservationManager } from "@/lib/reservations"
import { Reservation } from "@/types"
// import { useAuth } from "@/contexts/AuthContext"

export default function HistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'all' | '7days' | '30days' | '90days'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = () => {
    setLoading(true)
    try {
      const allReservations = ReservationManager.getAllReservations()
      // Sort by start time, most recent first
      const sortedReservations = allReservations.sort((a, b) => 
        new Date(b.timeSlot.start).getTime() - new Date(a.timeSlot.start).getTime()
      )
      setReservations(sortedReservations)
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
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

  const formatDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filterByTime = (reservations: Reservation[]) => {
    if (timeFilter === 'all') return reservations
    
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeFilter) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30days':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90days':
        cutoffDate.setDate(now.getDate() - 90)
        break
    }
    
    return reservations.filter(r => r.timeSlot.start >= cutoffDate)
  }

  const filterByStatus = (reservations: Reservation[]) => {
    if (statusFilter === 'all') return reservations
    return reservations.filter(r => r.displayStatus === statusFilter)
  }

  const filteredReservations = filterByStatus(filterByTime(reservations))

  const totalSessions = filteredReservations.length
  const completedSessions = filteredReservations.filter(r => r.displayStatus === 'completed').length
  const totalCost = filteredReservations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
  const totalDuration = filteredReservations.reduce((sum, r) => {
    const duration = r.timeSlot.end.getTime() - r.timeSlot.start.getTime()
    return sum + duration
  }, 0)
  const totalHours = Math.floor(totalDuration / (1000 * 60 * 60))

  const exportData = () => {
    const csvContent = [
      ['Date', 'Station', 'Start Time', 'End Time', 'Duration', 'Status', 'Cost'].join(','),
      ...filteredReservations.map(r => [
        formatDate(r.timeSlot.start),
        r.stationName,
        formatTime(r.timeSlot.start),
        formatTime(r.timeSlot.end),
        formatDuration(r.timeSlot.start, r.timeSlot.end),
        r.displayStatus,
        r.estimatedCost?.toFixed(2) || '0.00'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `charging-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateDemoData = () => {
    // Demo data generation would be implemented here
    loadReservations()
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
                <h1 className="text-3xl font-bold text-white">Charging History</h1>
                <p className="text-gray-300 mt-2">View your past charging sessions and statistics</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportData}
                  className="text-white border-white"
                  disabled={filteredReservations.length === 0}
                >
                  <FaDownload className="mr-2 h-3 w-3" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={generateDemoData} className="text-white border-white">
                  Add Demo Data
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <FaCalendarAlt className="h-6 w-6 text-[#FFA500] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{totalSessions}</div>
                  <div className="text-sm text-gray-300">Total Sessions</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <FaClock className="h-6 w-6 text-[#FFA500] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{totalHours}h</div>
                  <div className="text-sm text-gray-300">Total Time</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <FaDollarSign className="h-6 w-6 text-[#FFA500] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">€{totalCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-300">Total Cost</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <FaBolt className="h-6 w-6 text-[#FFA500] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{completedSessions}</div>
                  <div className="text-sm text-gray-300">Completed</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex gap-2">
                <span className="text-white text-sm font-medium self-center">Time Period:</span>
                {[
                  { key: 'all', label: 'All Time' },
                  { key: '7days', label: 'Last 7 Days' },
                  { key: '30days', label: 'Last 30 Days' },
                  { key: '90days', label: 'Last 90 Days' }
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    variant={timeFilter === tab.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFilter(tab.key as 'all' | '7days' | '30days' | '90days')}
                    className={timeFilter === tab.key ? 
                      "bg-[#FFA500] text-black border-[#FFA500]" : 
                      "bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
                    }
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <span className="text-white text-sm font-medium self-center">Status:</span>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' }
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    variant={statusFilter === tab.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(tab.key as 'all' | 'completed' | 'cancelled')}
                    className={statusFilter === tab.key ? 
                      "bg-[#FFA500] text-black border-[#FFA500]" : 
                      "bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
                    }
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFA500] mx-auto mb-4"></div>
                <p className="text-white">Loading your charging history...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredReservations.length === 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-12">
                  <FaClock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No charging history found</h3>
                  <p className="text-gray-300 mb-6">
                    No charging sessions match your current filters.
                  </p>
                  <Button variant="outline" onClick={generateDemoData} className="text-white border-white">
                    Add Demo Data
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* History List */}
            {!loading && filteredReservations.length > 0 && (
              <div className="space-y-4">
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
                          
                          <div className="grid md:grid-cols-4 gap-4 text-sm">
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
                              <span>{formatDuration(reservation.timeSlot.start, reservation.timeSlot.end)}</span>
                            </div>
                            
                            {reservation.estimatedCost && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <FaDollarSign className="h-4 w-4" />
                                <span>€{reservation.estimatedCost.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}