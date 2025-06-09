"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaUserCircle, FaBolt, FaDollarSign, FaClock, FaLeaf, FaCreditCard, FaCalendar, FaHistory, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ReservationDashboard from "@/components/ReservationDashboard"
import { ReservationManager } from "@/lib/reservations"
import { Reservation, BookingStatus, backendToDisplayStatus } from "@/types"
import { StatisticsAPI, CurrentMonthStats, MonthlyData, WeeklyData, BookingDTO } from "@/lib/api"

// Constants for calculations
const DEFAULT_CHARGING_POWER_KW = 22 // Average charging power in kW
const CO2_SAVED_PER_KWH = 0.4 // kg CO2 saved per kWh
const CO2_EQUIVALENT_FACTOR = 0.35 // kg CO2 equivalent factor
const GASOLINE_EQUIVALENT_FACTOR = 0.43 // L gasoline equivalent per kg CO2

// Type guard for BookingStatus
const isValidBookingStatus = (status: string): status is BookingStatus => {
  return ['ACTIVE', 'CANCELLED', 'COMPLETED'].includes(status)
}

interface HoveredData {
  type: 'stat' | 'month' | 'week' | 'trend'
  index?: number
  data?: {
    month?: string
    fullMonth?: string
    cost?: number
    sessions?: number
    duration?: number
    kwh?: number
    height?: number
    reservations?: Reservation[] | BookingDTO[]
    week?: string
    dateRange?: string
    title?: string
    value?: string
    detail?: string
  }
  x?: number
  y?: number
}

// Helper function to convert Reservation to BookingDTO for type compatibility
const reservationToBookingDTO = (reservation: Reservation): BookingDTO => ({
  id: parseInt(reservation.id.replace(/\D/g, '')) || Math.abs(crypto.randomUUID().slice(0, 8).split('').reduce((a, c) => a + c.charCodeAt(0), 0)), // Extract numbers or generate secure random ID
  userId: reservation.userId ?? 0,
  stationId: reservation.stationId,
  startTime: reservation.timeSlot.start.toISOString(),
  endTime: reservation.timeSlot.end.toISOString(),
  cost: reservation.estimatedCost ?? 0,
  status: reservation.status
})

// Helper function to convert BookingDTO back to Reservation for UI compatibility
const bookingDTOToReservation = (booking: BookingDTO): Reservation => ({
  id: booking.id.toString(),
  stationId: booking.stationId,
  stationName: `Station ${booking.stationId}`, // Default name since BookingDTO doesn't include it
  userId: booking.userId,
  timeSlot: {
    start: new Date(booking.startTime),
    end: new Date(booking.endTime)
  },
  chargerCount: 1, // Default value
  status: isValidBookingStatus(booking.status) ? booking.status : 'ACTIVE', // Safe type check
  displayStatus: backendToDisplayStatus(isValidBookingStatus(booking.status) ? booking.status : 'ACTIVE'), // Safe type conversion
  createdAt: new Date(),
  updatedAt: new Date(),
  estimatedCost: booking.cost
})

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
  const [hoveredData, setHoveredData] = useState<HoveredData | null>(null)

  // API Statistics state
  const [currentMonthStats, setCurrentMonthStats] = useState<CurrentMonthStats | null>(null)
  const [apiMonthlyStats, setApiMonthlyStats] = useState<MonthlyData[]>([])
  const [apiWeeklyStats, setApiWeeklyStats] = useState<WeeklyData[]>([])
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      setIsUnauthorized(false)
      
      try {
        // Try to load statistics from API
        const [currentStats, monthlyData, weeklyData] = await Promise.all([
          StatisticsAPI.getCurrentMonthStats(),
          StatisticsAPI.getMonthlyStats(12),
          StatisticsAPI.getWeeklyCurrentMonthStats()
        ])
        
        setCurrentMonthStats(currentStats)
        setApiMonthlyStats(monthlyData)
        setApiWeeklyStats(weeklyData)
        setUsingFallbackData(false)
        
      } catch (apiError: unknown) {
        console.error('Error loading statistics from API:', apiError)
        
        // Check if it's a 403 unauthorized error
        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError)
        const errorStatus = apiError && typeof apiError === 'object' && 'status' in apiError ? (apiError as { status: number }).status : null
        if (errorMessage.includes('403') || errorStatus === 403) {
          setIsUnauthorized(true)
          setError('Acesso negado. Você precisa estar autenticado para visualizar as estatísticas.')
          setLoading(false)
          return
        }
        
        // For other errors, fall back to localStorage data
        setUsingFallbackData(true)
        loadReservationsFromStorage()
      }
      
      setLoading(false)
    }

    const loadReservationsFromStorage = () => {
      try {
        const localReservations = ReservationManager.getAllReservations()
        setReservations(localReservations)
      } catch (storageError) {
        console.error('Error loading reservations from localStorage:', storageError)
        setError('Erro ao carregar dados locais. Tente recarregar a página.')
      }
    }

    loadData()

    // Listen for storage changes
    const handleStorageChange = () => {
      if (usingFallbackData) {
        loadReservationsFromStorage()
      }
    }

    // Listen for custom events from other components
    const handleReservationUpdate = () => {
      if (usingFallbackData) {
        // Force reload to ensure latest data after reservation changes
        loadReservationsFromStorage()
        // Trigger a re-calculation of statistics to reflect changes
        setLoading(true)
        setTimeout(() => setLoading(false), 100) // Brief loading state to show update
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('reservationUpdated', handleReservationUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reservationUpdated', handleReservationUpdate)
    }
  }, [usingFallbackData])

  // Calculate monthly stats from reservations (fallback when using localStorage)
  const calculateMonthlyStats = () => {
    if (!usingFallbackData && currentMonthStats) {
      return {
        totalCost: currentMonthStats.totalCost,
        estimatedKwh: currentMonthStats.estimatedKwh,
        totalSessions: currentMonthStats.totalSessions,
        co2Saved: currentMonthStats.co2Saved,
        avgCostPerSession: currentMonthStats.avgCostPerSession
      }
    }

    // Fallback calculation from localStorage reservations
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const currentMonthReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.timeSlot.start)
      return reservationDate.getMonth() === currentMonth && 
             reservationDate.getFullYear() === currentYear &&
             reservation.displayStatus !== 'cancelled'
    })

    const totalCost = currentMonthReservations.reduce((sum, reservation) => sum + (reservation.estimatedCost ?? 0), 0)
    const totalSessions = currentMonthReservations.length
    const estimatedKwh = currentMonthReservations.reduce((sum, reservation) => {
      const duration = (new Date(reservation.timeSlot.end).getTime() - new Date(reservation.timeSlot.start).getTime()) / (1000 * 60 * 60)
      return sum + (duration * DEFAULT_CHARGING_POWER_KW)
    }, 0)
    const co2Saved = estimatedKwh * CO2_SAVED_PER_KWH
    const avgCostPerSession = totalSessions > 0 ? totalCost / totalSessions : 0

    return {
      totalCost,
      estimatedKwh,
      totalSessions,
      co2Saved,
      avgCostPerSession
    }
  }

  // Generate monthly data (fallback when using localStorage)
  const generateMonthlyData = () => {
    if (!usingFallbackData && apiMonthlyStats.length > 0) {
      // Add height calculation for API data
      const maxCost = Math.max(...apiMonthlyStats.map(d => d.cost), 1)
      return apiMonthlyStats.map(data => ({
        ...data,
        height: (data.cost / maxCost) * 100
      }))
    }

    // Fallback generation from localStorage reservations
    const monthlyData: MonthlyData[] = []
    const currentDate = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const month = date.toISOString().slice(0, 7)
      const fullMonth = date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
      
      const monthReservations = reservations.filter(reservation => {
        const reservationDate = new Date(reservation.timeSlot.start)
        return reservationDate.getMonth() === date.getMonth() && 
               reservationDate.getFullYear() === date.getFullYear() &&
               reservation.displayStatus !== 'cancelled'
      })

      const cost = monthReservations.reduce((sum, reservation) => sum + (reservation.estimatedCost ?? 0), 0)
      const sessions = monthReservations.length
      const duration = monthReservations.reduce((sum, reservation) => {
        return sum + (new Date(reservation.timeSlot.end).getTime() - new Date(reservation.timeSlot.start).getTime()) / (1000 * 60 * 60)
      }, 0)
      const kwh = duration * DEFAULT_CHARGING_POWER_KW

      monthlyData.push({
        month,
        fullMonth,
        cost,
        sessions,
        duration,
        kwh,
        reservations: monthReservations.map(reservationToBookingDTO)
      })
    }
    
    // Calculate heights for chart rendering
    const maxCost = Math.max(...monthlyData.map(d => d.cost), 1)
    return monthlyData.map(data => ({
      ...data,
      height: (data.cost / maxCost) * 100
    }))
  }

  // Generate weekly data (fallback when using localStorage)
  const generateWeeklyData = () => {
    if (!usingFallbackData && apiWeeklyStats.length > 0) {
      // Add height calculation for API data
      const maxSessions = Math.max(...apiWeeklyStats.map(d => d.sessions), 1)
      return apiWeeklyStats.map(data => ({
        ...data,
        height: (data.sessions / maxSessions) * 100
      }))
    }

    // Fallback generation from localStorage reservations
    const weeklyData: WeeklyData[] = []
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Get first day of current month
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    
    // Generate weeks for current month
    const weekStart = new Date(firstDay)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start from Sunday
    
    let weekNumber = 1
    while (weekStart <= lastDay) {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekReservations = reservations.filter(reservation => {
        const reservationDate = new Date(reservation.timeSlot.start)
        return reservationDate >= weekStart && reservationDate <= weekEnd &&
               reservation.displayStatus !== 'cancelled'
      })

      const cost = weekReservations.reduce((sum, reservation) => sum + (reservation.estimatedCost ?? 0), 0)
      const sessions = weekReservations.length
      
      weeklyData.push({
        week: `W${weekNumber}`,
        sessions,
        cost,
        dateRange: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
        reservations: weekReservations.map(reservationToBookingDTO)
      })
      
      weekStart.setDate(weekStart.getDate() + 7)
      weekNumber++
    }
    
    // Calculate heights for chart rendering
    const maxSessions = Math.max(...weeklyData.map(d => d.sessions), 1)
    return weeklyData.map(data => ({
      ...data,
      height: (data.sessions / maxSessions) * 100
    }))
  }

  // Handle month click
  const handleMonthClick = (monthData: { month: string; cost: number; sessions: number; reservations: BookingDTO[] }) => {
    setSelectedMonth(selectedMonth === monthData.month ? null : monthData.month)
    setSelectedWeek(null)
  }

  // Handle week click
  const handleWeekClick = (weekData: { week: string; sessions: number; cost: number; reservations: BookingDTO[] }) => {
    setSelectedWeek(selectedWeek === weekData.week ? null : weekData.week)
    setSelectedMonth(null)
  }

  // Filter reservations based on selection
  const getFilteredReservations = (): Reservation[] => {
    if (selectedMonth) {
      const monthData = monthlyData.find(m => m.month === selectedMonth)
      return monthData?.reservations.map(bookingDTOToReservation) ?? []
    }
    if (selectedWeek) {
      const weekData = weeklyData.find(w => w.week === selectedWeek)
      return weekData?.reservations.map(bookingDTOToReservation) ?? []
    }
    return []
  }

  const monthlyStats = calculateMonthlyStats()
  const monthlyData = generateMonthlyData()
  const weeklyData = generateWeeklyData()
  const filteredReservations = getFilteredReservations()

  // Helper function to calculate cost change indicator
  const getCostChangeIndicator = (): string => {
    if (monthlyData.length <= 1) return '+'
    
    const currentMonthCost = monthlyData[11]?.cost ?? 0
    const previousMonthCost = monthlyData[10]?.cost ?? 0
    
    return currentMonthCost > previousMonthCost ? '+' : ''
  }

  const stats = [
    {
      title: "This month's costs",
      value: `€${monthlyStats.totalCost}`,
      icon: <FaDollarSign className="h-5 w-5 text-white" />,
      detail: `Avg per session: €${monthlyStats.avgCostPerSession}`,
      change: getCostChangeIndicator()
    },
    {
      title: "This month's kWh",
      value: `${monthlyStats.estimatedKwh} kWh`,
      icon: <FaBolt className="h-5 w-5 text-white" />,
      detail: `~${(monthlyStats.estimatedKwh * CO2_EQUIVALENT_FACTOR).toFixed(2)} kg CO2 equivalent`,
      change: '+'
    },
    {
      title: "This month's sessions",
      value: `${monthlyStats.totalSessions} times`,
      icon: <FaClock className="h-5 w-5 text-white" />,
      detail: monthlyStats.totalSessions > 0 ? `Active charging habit!` : 'Start your first session',
      change: '+'
    },
    {
      title: "CO2 Saved",
      value: `${monthlyStats.co2Saved} kg`,
      icon: <FaLeaf className="h-5 w-5 text-white" />,
      detail: `Equivalent to ${(monthlyStats.co2Saved * GASOLINE_EQUIVALENT_FACTOR).toFixed(1)} L gasoline saved`,
      change: '+'
    }
  ]

  const sidebarItems = [
    {
      title: "My Bookings",
      icon: <FaCalendar className="h-5 w-5 text-white" />,
      href: "/bookings"
    },
    {
      title: "History",
      icon: <FaHistory className="h-5 w-5 text-white" />,
      href: "/history"
    },
    {
      title: "Payments",
      icon: <FaCreditCard className="h-5 w-5 text-white" />,
      href: "/payments"
    }
  ]

  // Show unauthorized error
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <FaExclamationTriangle className="mx-auto text-red-500 text-4xl mb-4" />
                <h2 className="text-xl font-semibold text-red-800 mb-2">Acesso Negado</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col w-screen overflow-hidden">
      <header>
        <Navbar />
      </header>
      <main className="p-8 h-full flex flex-row items-start bg-[#14213d] text-[#FCA311] overflow-y-auto">
        {/* Sidebar Navigation */}
        <div className="align-middle p-10 justify-center flex flex-col items-center w-1/4 text-center sticky top-0">
            {sidebarItems.map((items) => (
              <Link key={items.href} href={items.href} className="w-full">
                <Card className="bg-[#FFA500] cursor-pointer hover:bg-[#FFA500]/90 transition-colors mb-4">
                  <CardContent className="p-4">
                    <h2 className="text-xl font-bold text-[#14213d]">{items.title}</h2>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
        <div className="w-full px-10 max-h-full overflow-y-auto">
          {/* Interactive Stats Cards */}
          <div className="flex flex-row gap-4 mb-4 align-middle justify-center">
            {stats.map((stat) => (
              <Card 
                key={stat.title} 
                className="bg-white rounded-lg shadow-md overflow-hidden w-1/4 flex align-middle hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                onMouseEnter={() => setHoveredData({ type: 'stat', data: stat })}
                onMouseLeave={() => setHoveredData(null)}
              >
                <CardContent className="flex flex-col relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{stat.title}</p>
                      <div className="flex items-baseline">
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        {stat.change && (
                          <span className="ml-2 text-sm text-green-500">{stat.change}23%</span>
                        )}
                      </div>
                      {hoveredData?.type === 'stat' && hoveredData?.data?.title === stat.title && (
                        <p className="text-xs text-gray-500 mt-1 animate-fade-in">
                          {stat.detail}
                        </p>
                      )}
                    </div>
                    <div className="bg-[#FFA500] p-2 rounded-full align-middle flex">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Profile */}
          <div className="flex flex-row gap-4 mb-4">
            <Card className="bg-[#FFA500] w-1/2">
              <CardContent className="p-6 flex flex-row justify-between items-center">
                <div>
                  <p className="text-sm text-[#14213d]">Welcome back,</p>
                  <h2 className="text-2xl font-bold text-[#14213d]">Gabriel Silva</h2>
                  <p className="text-[#14213d]">Glad to see you again!</p>
                  <Button className="mt-2 bg-white text-[#14213d] hover:bg-white/90">Edit Profile</Button>
                </div>
                <div className="flex flex-col items-center mt-4 md:mt-0">
                  <h3 className="text-xl font-semibold text-[#14213d]">Type of User</h3>
                  <FaUserCircle className="h-20 w-20 text-white mt-2" />
                  <p className="text-xl font-semibold text-[#14213d] mt-2">Driver</p>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Monthly Cost Chart */}
            <Card className="bg-white w-1/2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Charging Costs</h3>
                  <FaInfoCircle className="text-gray-400 cursor-help" title="Click on bars to see details" />
                </div>
                <div className="h-48 relative">
                  <div className="w-full h-full flex items-end justify-between px-4">
                    {monthlyData.map((data) => (
                      <button 
                        key={data.month} 
                        className={`rounded-t cursor-pointer transition-all duration-200 hover:opacity-80 border-0 ${
                          selectedMonth === data.month ? 'bg-[#14213d] ring-2 ring-[#FFA500]' : 'bg-[#FFA500] hover:bg-[#FFA500]/90'
                        }`}
                        style={{ 
                          width: '24px',
                          height: `${data.height}%` 
                        }}
                        onClick={() => handleMonthClick(data)}
                        aria-label={`${data.fullMonth}: €${data.cost.toFixed(2)} (${data.sessions} sessions)`}
                        onMouseEnter={() => setHoveredData({ type: 'month', data })}
                        onMouseLeave={() => setHoveredData(null)}
                        title={`${data.fullMonth}: €${data.cost.toFixed(2)} (${data.sessions} sessions)`}
                      ></button>
                    ))}
                  </div>
                  <div className="w-full flex justify-between mt-2 text-xs text-gray-500">
                    {monthlyData.map((data) => (
                      <button 
                        key={`label-${data.month}`}
                        className={`cursor-pointer transition-colors border-0 bg-transparent p-0 ${
                          selectedMonth === data.month ? 'text-[#FFA500] font-bold' : 'hover:text-[#FFA500]'
                        }`}
                        onClick={() => handleMonthClick(data)}
                        aria-label={`Select ${data.month}`}
                      >
                        {data.month}
                      </button>
                    ))}
                  </div>
                  
                  {/* Tooltip */}
                  {hoveredData?.type === 'month' && hoveredData.data && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded shadow-lg text-xs z-10">
                      <div className="font-semibold">{hoveredData.data.fullMonth || 'Unknown Month'}</div>
                      <div>Cost: €{(hoveredData.data.cost || 0).toFixed(2)}</div>
                      <div>Sessions: {hoveredData.data.sessions || 0}</div>
                      <div>Energy: {hoveredData.data.kwh || 0} kWh</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-row gap-4 mb-6">
            {/* Interactive Weekly Sessions Chart */}
            <Card className="bg-white w-1/2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Sessions This Month</h3>
                  <FaInfoCircle className="text-gray-400 cursor-help" title="Click on bars to see weekly details" />
                </div>
                <div className="h-48 relative">
                  <div className="w-full h-[80%] flex items-end justify-around">
                    {weeklyData.map((data) => (
                      <div key={data.week} className="flex flex-col items-center">
                        <button 
                          className={`w-12 rounded-sm cursor-pointer transition-all duration-200 hover:opacity-80 border-0 ${
                            selectedWeek === data.week ? 'bg-[#FFA500] ring-2 ring-[#14213d]' : 'bg-[#14213d] hover:bg-[#14213d]/90'
                          }`}
                          style={{ height: `${data.height}%` }}
                          onClick={() => handleWeekClick(data)}
                          onMouseEnter={() => setHoveredData({ type: 'week', data })}
                          onMouseLeave={() => setHoveredData(null)}
                          aria-label={`${data.week}: ${data.sessions} sessions, €${data.cost.toFixed(2)}`}
                          title={`${data.week}: ${data.sessions} sessions, €${data.cost.toFixed(2)}`}
                        />
                        <button 
                          className={`mt-2 text-gray-500 cursor-pointer text-xs transition-colors border-0 bg-transparent p-0 ${
                            selectedWeek === data.week ? 'text-[#FFA500] font-bold' : 'hover:text-[#FFA500]'
                          }`}
                          onClick={() => handleWeekClick(data)}
                          aria-label={`Select ${data.week}`}
                        >
                          {data.week}
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Week Tooltip */}
                  {hoveredData?.type === 'week' && hoveredData.data && (
                    <div className="absolute top-0 right-0 bg-black text-white p-2 rounded shadow-lg text-xs z-10">
                      <div className="font-semibold">{hoveredData.data.week || 'Unknown Week'}</div>
                      <div>{hoveredData.data.dateRange || 'Unknown Date Range'}</div>
                      <div>Sessions: {hoveredData.data.sessions || 0}</div>
                      <div>Cost: €{(hoveredData.data.cost || 0).toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interactive Cost Trend Chart */}
            <Card className="bg-white w-1/2">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Cost Trend (Last 8 Months)</h3>
                <div className="h-48 relative">
                  <div className="h-full flex items-center">
                    <svg viewBox="0 0 400 150" className="w-full h-full">
                      {/* Trend Line */}
                      <path
                        d={`M0,${150 - (monthlyData[4]?.height || 50)} ${monthlyData.slice(4).map((data, index) => 
                          `L${(index + 1) * 50},${150 - (data.height || 50)}`
                        ).join(' ')}`}
                        fill="none"
                        stroke="#FFA500"
                        strokeWidth="3"
                        className="hover:stroke-[#14213d] transition-colors duration-200"
                      />
                      {/* Interactive Points */}
                      {monthlyData.slice(4).map((data) => (
                        <circle
                          key={data.month}
                          cx={(monthlyData.indexOf(data) - 3) * 50}
                          cy={150 - (data.height || 50)}
                          r="6"
                          fill="#FFA500"
                          className="cursor-pointer hover:fill-[#14213d] transition-colors duration-200"
                          onClick={() => handleMonthClick(data)}
                          onMouseEnter={() => setHoveredData({ type: 'trend', data, x: (monthlyData.indexOf(data) - 3) * 50, y: 150 - (data.height || 50) })}
                          onMouseLeave={() => setHoveredData(null)}
                          role="button"
                          tabIndex={0}
                          aria-label={`${data.month}: €${(data.cost || 0).toFixed(2)}`}
                        />
                      ))}
                      
                      {/* Trend Tooltip */}
                      {hoveredData?.type === 'trend' && hoveredData.x && hoveredData.y && hoveredData.data && (
                        <g>
                          <rect
                            x={hoveredData.x - 30}
                            y={hoveredData.y - 40}
                            width="60"
                            height="30"
                            fill="black"
                            rx="4"
                            opacity="0.9"
                          />
                          <text
                            x={hoveredData.x}
                            y={hoveredData.y - 30}
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                          >
                            {hoveredData.data.month || ''}
                          </text>
                          <text
                            x={hoveredData.x}
                            y={hoveredData.y - 18}
                            textAnchor="middle"
                            fill="white"
                            fontSize="8"
                          >
                            €{(hoveredData.data.cost || 0).toFixed(0)}
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                  <div className="w-full flex justify-between text-xs text-gray-500">
                    {monthlyData.slice(4).map((data) => (
                      <button 
                        key={`trend-label-${data.month}`}
                        className="cursor-pointer hover:text-[#FFA500] transition-colors border-0 bg-transparent p-0"
                        onClick={() => handleMonthClick(data)}
                        aria-label={`Select ${data.month}`}
                      >
                        {data.month}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Period Details */}
          {(selectedMonth || selectedWeek) && filteredReservations.length > 0 && (
            <Card className="bg-blue-50 border-blue-200 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-blue-900">
                    {selectedMonth ? `${monthlyData.find(m => m.month === selectedMonth)?.fullMonth} Details` : 
                     selectedWeek ? `${selectedWeek} Details` : ''}
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {setSelectedMonth(null); setSelectedWeek(null)}}
                    className="text-blue-700 border-blue-300"
                  >
                    Close
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Total Reservations</p>
                    <p className="text-xl font-bold text-blue-700">{filteredReservations.length}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Total Cost</p>
                    <p className="text-xl font-bold text-blue-700">
                      €{filteredReservations.reduce((sum, r) => sum + (r.estimatedCost ?? 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Avg Cost per Session</p>
                    <p className="text-xl font-bold text-blue-700">
                      €{(filteredReservations.reduce((sum, r) => sum + (r.estimatedCost ?? 0), 0) / filteredReservations.length).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">Recent Sessions:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filteredReservations.slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="text-xs bg-white p-2 rounded border border-blue-200">
                        <span className="font-medium">{reservation.stationName}</span> - 
                        <span className="ml-1">{new Date(reservation.timeSlot.start).toLocaleDateString()}</span> - 
                        <span className="ml-1 text-blue-600">€{reservation.estimatedCost?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Reservations Section */}
          <div className="bg-white rounded-lg p-6">
            <ReservationDashboard />
          </div>
        </div>
      </main>
    </div>
  )
}
