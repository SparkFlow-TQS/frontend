import { 
  Reservation, 
  ReservationRequest, 
  StationAvailability, 
  TimeSlot, 
  ReservationConflict,
  BookingStatus,
  ReservationDisplayStatus,
  backendToDisplayStatus,
  displayToBackendStatus,
  formatRecurringDays,
  getDayOfWeek
} from '@/types'
import { DEFAULT_CHARGERS_PER_STATION } from '@/types/station'

const RESERVATIONS_STORAGE_KEY = 'sparkflow_reservations'

// ===== LOCAL STORAGE UTILITIES =====

export class ReservationManager {
  
  // Get all reservations from localStorage
  static getAllReservations(): Reservation[] {
    try {
      const stored = localStorage.getItem(RESERVATIONS_STORAGE_KEY)
      if (!stored) return []
      
      const reservations = JSON.parse(stored)
      // Convert date strings back to Date objects and handle legacy data
      return reservations.map((r: any) => ({
        ...r,
        stationId: typeof r.stationId === 'string' ? parseInt(r.stationId) : r.stationId,
        userId: r.userId ? (typeof r.userId === 'string' ? parseInt(r.userId) : r.userId) : undefined,
        timeSlot: {
          start: new Date(r.timeSlot.start),
          end: new Date(r.timeSlot.end)
        },
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        // Handle status conversion for backward compatibility
        status: r.status || displayToBackendStatus(r.displayStatus || 'pending'),
        displayStatus: r.displayStatus || backendToDisplayStatus(r.status || 'ACTIVE'),
        // Convert recurringDays array to Set if needed
        recurringDays: r.recurringDays ? new Set(Array.isArray(r.recurringDays) ? r.recurringDays : Array.from(r.recurringDays)) : undefined
      }))
    } catch (error) {
      console.error('Error loading reservations from localStorage:', error)
      return []
    }
  }

  // Save reservations to localStorage
  static saveReservations(reservations: Reservation[]): void {
    try {
      // Convert Sets to arrays for JSON serialization
      const serializable = reservations.map(r => ({
        ...r,
        recurringDays: r.recurringDays ? Array.from(r.recurringDays) : undefined
      }))
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(serializable))
    } catch (error) {
      console.error('Error saving reservations to localStorage:', error)
    }
  }

  // Create a new reservation
  static createReservation(request: ReservationRequest, stationName: string, userId?: number): Reservation {
    const now = new Date()
    const reservation: Reservation = {
      id: this.generateReservationId(),
      stationId: request.stationId,
      stationName,
      userId,
      timeSlot: request.timeSlot,
      chargerCount: request.chargerCount,
      status: 'ACTIVE',
      displayStatus: 'pending',
      recurringDays: request.recurringDays,
      createdAt: now,
      updatedAt: now,
      estimatedCost: this.calculateEstimatedCost(request.timeSlot, request.chargerCount)
    }

    const reservations = this.getAllReservations()
    
    // If recurring, create multiple reservations for the next 4 weeks
    if (request.recurringDays && request.recurringDays.size > 0) {
      const recurringReservations = this.generateRecurringReservations(reservation, 4)
      reservations.push(...recurringReservations)
    } else {
      reservations.push(reservation)
    }
    
    this.saveReservations(reservations)
    return reservation
  }

  // Generate recurring reservations for the specified number of weeks
  static generateRecurringReservations(baseReservation: Reservation, weeksAhead: number): Reservation[] {
    if (!baseReservation.recurringDays || baseReservation.recurringDays.size === 0) {
      return [baseReservation]
    }

    const reservations: Reservation[] = []
    const startDate = new Date(baseReservation.timeSlot.start)
    const duration = baseReservation.timeSlot.end.getTime() - baseReservation.timeSlot.start.getTime()

    // Generate reservations for each recurring day in the next weeks
    for (let week = 0; week < weeksAhead; week++) {
      for (const dayOfWeek of baseReservation.recurringDays) {
        const reservationDate = new Date(startDate)
        const daysToAdd = (week * 7) + (dayOfWeek - startDate.getDay() + 7) % 7
        reservationDate.setDate(startDate.getDate() + daysToAdd)
        
        // Skip if it's in the past
        if (reservationDate <= new Date()) continue
        
        const reservationStart = new Date(reservationDate)
        reservationStart.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds())
        
        const reservationEnd = new Date(reservationStart.getTime() + duration)

        reservations.push({
          ...baseReservation,
          id: this.generateReservationId(),
          timeSlot: {
            start: reservationStart,
            end: reservationEnd
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }

    return reservations.length > 0 ? reservations : [baseReservation]
  }

  // Get reservations for a specific station
  static getReservationsForStation(stationId: number): Reservation[] {
    return this.getAllReservations().filter(r => r.stationId === stationId)
  }

  // Get reservations for a specific date range
  static getReservationsInRange(start: Date, end: Date): Reservation[] {
    return this.getAllReservations().filter(reservation => {
      const resStart = reservation.timeSlot.start
      const resEnd = reservation.timeSlot.end
      
      // Check if reservation overlaps with the range
      return resStart < end && resEnd > start
    })
  }

  // Update reservation status
  static updateReservationStatus(reservationId: string, displayStatus: ReservationDisplayStatus): boolean {
    const reservations = this.getAllReservations()
    const index = reservations.findIndex(r => r.id === reservationId)
    
    if (index === -1) return false
    
    reservations[index].displayStatus = displayStatus
    reservations[index].status = displayToBackendStatus(displayStatus)
    reservations[index].updatedAt = new Date()
    this.saveReservations(reservations)
    
    return true
  }

  // Delete a reservation (mark as cancelled for backend compatibility)
  static deleteReservation(reservationId: string): boolean {
    const reservations = this.getAllReservations()
    const index = reservations.findIndex(r => r.id === reservationId)
    
    if (index === -1) return false
    
    reservations[index].status = 'CANCELLED'
    reservations[index].displayStatus = 'cancelled'
    reservations[index].updatedAt = new Date()
    this.saveReservations(reservations)
    
    return true
  }

  // Check availability for a station at a specific time slot
  static checkAvailability(
    stationId: number, 
    timeSlot: TimeSlot, 
    totalChargers: number = DEFAULT_CHARGERS_PER_STATION,
    excludeReservationId?: string
  ): { availableChargers: number; conflicts: ReservationConflict[] } {
    const reservations = this.getReservationsForStation(stationId)
      .filter(r => r.id !== excludeReservationId && r.status !== 'CANCELLED')

    const conflicts: ReservationConflict[] = []
    let maxChargersInUse = 0

    // Check each time point for overlapping reservations
    const timePoints = this.generateTimePoints(timeSlot, reservations)
    
    for (const timePoint of timePoints) {
      const overlappingReservations = reservations.filter(reservation => 
        reservation.timeSlot.start <= timePoint && reservation.timeSlot.end > timePoint
      )

      const chargersInUse = overlappingReservations.reduce((sum, res) => sum + res.chargerCount, 0)
      maxChargersInUse = Math.max(maxChargersInUse, chargersInUse)

      if (chargersInUse >= totalChargers) {
        conflicts.push({
          timeSlot: { start: timePoint, end: timePoint },
          conflictingReservations: overlappingReservations,
          availableChargers: totalChargers - chargersInUse
        })
      }
    }

    return {
      availableChargers: Math.max(0, totalChargers - maxChargersInUse),
      conflicts
    }
  }

  // Generate availability data for a station for a specific date
  static getStationAvailability(
    stationId: number, 
    date: Date, 
    totalChargers: number = DEFAULT_CHARGERS_PER_STATION
  ): StationAvailability {
    const dateStr = date.toISOString().split('T')[0]
    const timeSlots = []

    // Generate hourly time slots for the day (6 AM to 11 PM)
    for (let hour = 6; hour <= 23; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(slotStart)
      slotEnd.setHours(hour + 1, 0, 0, 0)

      const availability = this.checkAvailability(
        stationId, 
        { start: slotStart, end: slotEnd }, 
        totalChargers
      )

      timeSlots.push({
        time: timeStr,
        availableChargers: availability.availableChargers,
        totalChargers,
        isBlocked: availability.availableChargers === 0
      })
    }

    return {
      stationId,
      date: dateStr,
      timeSlots
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private static generateReservationId(): string {
    return 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  private static calculateEstimatedCost(timeSlot: TimeSlot, chargerCount: number): number {
    const hours = (timeSlot.end.getTime() - timeSlot.start.getTime()) / (1000 * 60 * 60)
    const baseRatePerHour = 6.50 // €6.50 per hour per charger
    return Number((hours * chargerCount * baseRatePerHour).toFixed(2))
  }

  private static generateTimePoints(timeSlot: TimeSlot, reservations: Reservation[]): Date[] {
    const points = new Set<number>()
    
    // Add start and end of the requested slot
    points.add(timeSlot.start.getTime())
    points.add(timeSlot.end.getTime())
    
    // Add start and end times of overlapping reservations
    for (const reservation of reservations) {
      if (reservation.timeSlot.start < timeSlot.end && reservation.timeSlot.end > timeSlot.start) {
        points.add(reservation.timeSlot.start.getTime())
        points.add(reservation.timeSlot.end.getTime())
      }
    }
    
    return Array.from(points).sort((a, b) => a - b).map(timestamp => new Date(timestamp))
  }

  // ===== DEMO DATA GENERATOR (for testing) =====
  
  static generateDemoReservations(stationId: number, stationName: string): void {
    const now = new Date()
    const demoReservations: Reservation[] = [
      {
        id: 'demo_1',
        stationId,
        stationName,
        userId: 1,
        timeSlot: {
          start: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
          end: new Date(now.getTime() + 4 * 60 * 60 * 1000)    // 4 hours from now
        },
        chargerCount: 1,
        status: 'ACTIVE',
        displayStatus: 'confirmed',
        createdAt: now,
        updatedAt: now,
        estimatedCost: 13.00
      },
      {
        id: 'demo_2',
        stationId,
        stationName,
        userId: 1,
        timeSlot: {
          start: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
          end: new Date(now.getTime() + 8 * 60 * 60 * 1000)    // 8 hours from now
        },
        chargerCount: 2,
        status: 'ACTIVE',
        displayStatus: 'pending',
        recurringDays: new Set([1, 3, 5]), // Monday, Wednesday, Friday
        createdAt: now,
        updatedAt: now,
        estimatedCost: 26.00
      },
      {
        id: 'demo_3',
        stationId,
        stationName,
        userId: 1,
        timeSlot: {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
          end: new Date(now.getTime() - 22 * 60 * 60 * 1000)    // Yesterday + 2h
        },
        chargerCount: 1,
        status: 'COMPLETED',
        displayStatus: 'completed',
        createdAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        estimatedCost: 13.00
      }
    ]

    const existing = this.getAllReservations()
    const filtered = existing.filter(r => r.stationId !== stationId || !r.id.startsWith('demo_'))
    this.saveReservations([...filtered, ...demoReservations])
  }

  // Clear all reservations
  static clearAllReservations(): void {
    localStorage.removeItem(RESERVATIONS_STORAGE_KEY)
  }
} 