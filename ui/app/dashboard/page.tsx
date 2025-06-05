"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaUserCircle, FaBolt, FaDollarSign, FaClock, FaLeaf, FaCreditCard, FaCalendar, FaHistory, FaInfoCircle } from "react-icons/fa"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ReservationDashboard from "@/components/ReservationDashboard"
import { ReservationManager } from "@/lib/reservations"
import { Reservation } from "@/types"

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
    reservations?: Reservation[]
    week?: string
    dateRange?: string
    title?: string
    value?: string
    detail?: string
  }
  x?: number
  y?: number
}

interface MonthData {
  month: string
  fullMonth: string
  cost: number
  sessions: number
  duration: number
  kwh: number
  height: number
  reservations: Reservation[]
}

interface WeekData {
  week: string
  sessions: number
  cost: number
  height: number
  dateRange: string
  reservations: Reservation[]
}

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
  const [hoveredData, setHoveredData] = useState<HoveredData | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const loadReservations = () => {
      try {
        const allReservations = ReservationManager.getAllReservations()
        setReservations(allReservations)
      } catch (error) {
        console.error('Error loading reservations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReservations()

    // Listen for localStorage changes to update in real-time
    const handleStorageChange = () => {
      loadReservations()
      setRefreshTrigger(prev => prev + 1)
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Custom event for same-tab updates
    window.addEventListener('reservationsUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reservationsUpdated', handleStorageChange)
    }
  }, [refreshTrigger])

  // Calculate monthly stats from reservations
  const calculateMonthlyStats = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyReservations = reservations.filter(r => {
      const reservationDate = new Date(r.timeSlot.start)
      return reservationDate.getMonth() === currentMonth && 
             reservationDate.getFullYear() === currentYear &&
             r.displayStatus !== 'cancelled'
    })

    const totalCost = monthlyReservations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
    const totalSessions = monthlyReservations.length
    const totalDuration = monthlyReservations.reduce((sum, r) => {
      const duration = (new Date(r.timeSlot.end).getTime() - new Date(r.timeSlot.start).getTime()) / (1000 * 60 * 60)
      return sum + duration
    }, 0)
    
    // Estimate kWh (assuming average 25kW charging power)
    const estimatedKwh = Math.round(totalDuration * 25)
    
    // Estimate CO2 saved (compared to gasoline car - roughly 2.3kg CO2 per liter)
    const co2Saved = Math.round(estimatedKwh * 0.4 / 2.3) // 0.4kg CO2 per kWh vs gasoline

    return {
      totalCost: totalCost.toFixed(2),
      estimatedKwh,
      totalSessions,
      co2Saved,
      avgCostPerSession: totalSessions > 0 ? (totalCost / totalSessions).toFixed(2) : '0.00'
    }
  }

  // Generate monthly data for the last 12 months
  const generateMonthlyData = () => {
    const months: Array<{
      month: string
      fullMonth: string
      cost: number
      sessions: number
      duration: number
      kwh: number
      height: number
      reservations: Reservation[]
    }> = []
    const currentDate = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      
      const monthReservations = reservations.filter(r => {
        const reservationDate = new Date(r.timeSlot.start)
        return reservationDate.getMonth() === month && 
               reservationDate.getFullYear() === year &&
               r.displayStatus !== 'cancelled'
      })
      
      const cost = monthReservations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
      const sessions = monthReservations.length
      const totalDuration = monthReservations.reduce((sum, r) => {
        const duration = (new Date(r.timeSlot.end).getTime() - new Date(r.timeSlot.start).getTime()) / (1000 * 60 * 60)
        return sum + duration
      }, 0)
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fullMonth: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        cost,
        sessions,
        duration: totalDuration,
        kwh: Math.round(totalDuration * 25),
        height: Math.max(10, Math.min(90, (cost / 50) * 80)), // Better scaling
        reservations: monthReservations
      })
    }
    
    return months
  }

  // Generate weekly data for current month
  const generateWeeklyData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return weeks.map((week, index) => {
      const startOfWeek = new Date(currentYear, currentMonth, (index * 7) + 1)
      const endOfWeek = new Date(currentYear, currentMonth, (index + 1) * 7)
      
      const weekReservations = reservations.filter(r => {
        const reservationDate = new Date(r.timeSlot.start)
        return reservationDate >= startOfWeek && 
               reservationDate <= endOfWeek &&
               r.displayStatus !== 'cancelled'
      })
      
      const sessions = weekReservations.length
      const cost = weekReservations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
      const height = Math.max(20, Math.min(85, sessions * 25)) // Better scaling
      
      return {
        week,
        sessions,
        cost,
        height,
        dateRange: `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`,
        reservations: weekReservations
      }
    })
  }

  // Handle month click
  const handleMonthClick = (monthData: { month: string; cost: number; sessions: number; reservations: Reservation[] }) => {
    setSelectedMonth(selectedMonth === monthData.month ? null : monthData.month)
    setSelectedWeek(null)
  }

  // Handle week click
  const handleWeekClick = (weekData: { week: string; sessions: number; cost: number; reservations: Reservation[] }) => {
    setSelectedWeek(selectedWeek === weekData.week ? null : weekData.week)
    setSelectedMonth(null)
  }

  // Filter reservations based on selection
  const getFilteredReservations = () => {
    if (selectedMonth) {
      const monthData = monthlyData.find(m => m.month === selectedMonth)
      return monthData?.reservations || []
    }
    if (selectedWeek) {
      const weekData = weeklyData.find(w => w.week === selectedWeek)
      return weekData?.reservations || []
    }
    return []
  }

  const monthlyStats = calculateMonthlyStats()
  const monthlyData = generateMonthlyData()
  const weeklyData = generateWeeklyData()
  const filteredReservations = getFilteredReservations()

  const stats = [
    {
      title: "This month's costs",
      value: `€${monthlyStats.totalCost}`,
      icon: <FaDollarSign className="h-5 w-5 text-white" />,
      detail: `Avg per session: €${monthlyStats.avgCostPerSession}`,
      change: monthlyData.length > 1 ? 
        ((monthlyData[11]?.cost || 0) - (monthlyData[10]?.cost || 0)) > 0 ? '+' : '' : '+'
    },
    {
      title: "This month's kWh",
      value: `${monthlyStats.estimatedKwh} kWh`,
      icon: <FaBolt className="h-5 w-5 text-white" />,
      detail: `~${(monthlyStats.estimatedKwh * 0.35).toFixed(2)} kg CO2 equivalent`,
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
      detail: `Equivalent to ${(monthlyStats.co2Saved * 0.43).toFixed(1)} L gasoline saved`,
      change: '+'
    }
  ]

  const sidebar_items = [
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

  if (loading) {
    return (
      <div className="flex h-screen flex-col w-screen overflow-hidden">
        <header>
          <Navbar />
        </header>
        <main className="h-screen flex flex-col bg-[#14213d] flex-1 p-4 md:p-6 items-center justify-center">
          <div className="text-white text-lg">Loading dashboard...</div>
        </main>
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
            {sidebar_items.map((items, index) => (
              <Link key={index} href={items.href} className="w-full">
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
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden w-1/4 flex align-middle hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                onMouseEnter={() => setHoveredData({ type: 'stat', index, data: stat })}
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
                      {hoveredData?.type === 'stat' && hoveredData?.index === index && (
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
                    {monthlyData.map((data, index) => (
                      <div 
                        key={index} 
                        className={`rounded-t cursor-pointer transition-all duration-200 hover:opacity-80 ${
                          selectedMonth === data.month ? 'bg-[#14213d] ring-2 ring-[#FFA500]' : 'bg-[#FFA500] hover:bg-[#FFA500]/90'
                        }`}
                        style={{ 
                          width: '24px',
                          height: `${data.height}%` 
                        }}
                        onClick={() => handleMonthClick(data)}
                        onMouseEnter={() => setHoveredData({ type: 'month', data })}
                        onMouseLeave={() => setHoveredData(null)}
                        title={`${data.fullMonth}: €${data.cost.toFixed(2)} (${data.sessions} sessions)`}
                      />
                    ))}
                  </div>
                  <div className="w-full flex justify-between mt-2 text-xs text-gray-500">
                    {monthlyData.map((data, index) => (
                      <span 
                        key={index}
                        className={`cursor-pointer transition-colors ${
                          selectedMonth === data.month ? 'text-[#FFA500] font-bold' : 'hover:text-[#FFA500]'
                        }`}
                        onClick={() => handleMonthClick(data)}
                      >
                        {data.month}
                      </span>
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
                    {weeklyData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`w-12 rounded-sm cursor-pointer transition-all duration-200 hover:opacity-80 ${
                            selectedWeek === data.week ? 'bg-[#FFA500] ring-2 ring-[#14213d]' : 'bg-[#14213d] hover:bg-[#14213d]/90'
                          }`}
                          style={{ height: `${data.height}%` }}
                          onClick={() => handleWeekClick(data)}
                          onMouseEnter={() => setHoveredData({ type: 'week', data })}
                          onMouseLeave={() => setHoveredData(null)}
                          title={`${data.week}: ${data.sessions} sessions, €${data.cost.toFixed(2)}`}
                        />
                        <span 
                          className={`mt-2 text-gray-500 cursor-pointer text-xs transition-colors ${
                            selectedWeek === data.week ? 'text-[#FFA500] font-bold' : 'hover:text-[#FFA500]'
                          }`}
                          onClick={() => handleWeekClick(data)}
                        >
                          W{index + 1}
                        </span>
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
                      {monthlyData.slice(4).map((data, index) => (
                        <circle
                          key={index}
                          cx={(index + 1) * 50}
                          cy={150 - (data.height || 50)}
                          r="6"
                          fill="#FFA500"
                          className="cursor-pointer hover:fill-[#14213d] transition-colors duration-200"
                          onClick={() => handleMonthClick(data)}
                          onMouseEnter={() => setHoveredData({ type: 'trend', data, x: (index + 1) * 50, y: 150 - (data.height || 50) })}
                          onMouseLeave={() => setHoveredData(null)}
                        />
                      ))}
                      
                      {/* Trend Tooltip */}
                      {hoveredData?.type === 'trend' && (
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
                            {hoveredData.data.month}
                          </text>
                          <text
                            x={hoveredData.x}
                            y={hoveredData.y - 18}
                            textAnchor="middle"
                            fill="white"
                            fontSize="8"
                          >
                            €{hoveredData.data.cost.toFixed(0)}
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                  <div className="w-full flex justify-between text-xs text-gray-500">
                    {monthlyData.slice(4).map((data, index) => (
                      <span 
                        key={index}
                        className="cursor-pointer hover:text-[#FFA500] transition-colors"
                        onClick={() => handleMonthClick(data)}
                      >
                        {data.month}
                      </span>
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
                      €{filteredReservations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Avg Cost per Session</p>
                    <p className="text-xl font-bold text-blue-700">
                      €{(filteredReservations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0) / filteredReservations.length).toFixed(2)}
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