import { Reservation, ReservationRequest, StationAvailability, TimeSlot, ReservationConflict } from '@/types'

const RESERVATIONS_STORAGE_KEY = 'sparkflow_reservations'

// ===== LOCAL STORAGE UTILITIES =====

export class ReservationManager {
  
  // Get all reservations from localStorage
  static getAllReservations(): Reservation[] {
    try {
      const stored = localStorage.getItem(RESERVATIONS_STORAGE_KEY)
      if (!stored) return []
      
      const reservations = JSON.parse(stored)
      // Convert date strings back to Date objects
      return reservations.map((r: {
        id: string;
        stationId: number | string;
        stationName: string;
        userId?: string;
        timeSlot: {
          start: string;
          end: string;
        };
        chargerCount: number;
        status: string;
        createdAt: string;
        updatedAt: string;
        estimatedCost?: number;
      }) => ({
        ...r,
        timeSlot: {
          start: new Date(r.timeSlot.start),
          end: new Date(r.timeSlot.end)
        },
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt)
      }))
    } catch (error) {
      console.error('Error loading reservations from localStorage:', error)
      return []
    }
  }

  // Save reservations to localStorage
  static saveReservations(reservations: Reservation[]): void {
    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations))
    } catch (error) {
      console.error('Error saving reservations to localStorage:', error)
    }
  }

  // Create a new reservation
  static createReservation(request: ReservationRequest, stationName: string): Reservation {
    const reservation: Reservation = {
      id: this.generateReservationId(),
      stationId: request.stationId,
      stationName,
      timeSlot: request.timeSlot,
      chargerCount: request.chargerCount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedCost: this.calculateEstimatedCost(request.timeSlot, request.chargerCount)
    }

    const reservations = this.getAllReservations()
    reservations.push(reservation)
    this.saveReservations(reservations)

    return reservation
  }

  // Get reservations for a specific station
  static getReservationsForStation(stationId: number | string): Reservation[] {
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
  static updateReservationStatus(reservationId: string, status: Reservation['status']): boolean {
    const reservations = this.getAllReservations()
    const index = reservations.findIndex(r => r.id === reservationId)
    
    if (index === -1) return false
    
    reservations[index].status = status
    reservations[index].updatedAt = new Date()
    this.saveReservations(reservations)
    
    return true
  }

  // Delete a reservation
  static deleteReservation(reservationId: string): boolean {
    const reservations = this.getAllReservations()
    const filtered = reservations.filter(r => r.id !== reservationId)
    
    if (filtered.length === reservations.length) return false
    
    this.saveReservations(filtered)
    return true
  }

  // Check availability for a station at a specific time slot
  static checkAvailability(
    stationId: number | string, 
    timeSlot: TimeSlot, 
    totalChargers: number,
    excludeReservationId?: string
  ): { availableChargers: number; conflicts: ReservationConflict[] } {
    const reservations = this.getReservationsForStation(stationId)
      .filter(r => r.id !== excludeReservationId && r.status !== 'cancelled')

    const conflicts: ReservationConflict[] = []
    let maxChargeersInUse = 0

    // Check each time point for overlapping reservations
    const timePoints = this.generateTimePoints(timeSlot, reservations)
    
    for (const timePoint of timePoints) {
      const overlappingReservations = reservations.filter(reservation => 
        reservation.timeSlot.start <= timePoint && reservation.timeSlot.end > timePoint
      )

      const chargersInUse = overlappingReservations.reduce((sum, res) => sum + res.chargerCount, 0)
      maxChargeersInUse = Math.max(maxChargeersInUse, chargersInUse)

      if (chargersInUse >= totalChargers) {
        conflicts.push({
          timeSlot: { start: timePoint, end: timePoint },
          conflictingReservations: overlappingReservations,
          availableChargers: totalChargers - chargersInUse
        })
      }
    }

    return {
      availableChargers: Math.max(0, totalChargers - maxChargeersInUse),
      conflicts
    }
  }

  // Generate availability data for a station for a specific date
  static getStationAvailability(
    stationId: number | string, 
    date: Date, 
    totalChargers: number
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

  // ===== UTILITY METHODS =====

  private static generateReservationId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static calculateEstimatedCost(timeSlot: TimeSlot, chargerCount: number): number {
    const durationHours = (timeSlot.end.getTime() - timeSlot.start.getTime()) / (1000 * 60 * 60)
    const baseRate = 0.35 // €0.35 per kWh
    const estimatedKwh = 25 // Average kWh per hour
    return durationHours * chargerCount * estimatedKwh * baseRate
  }

  private static generateTimePoints(timeSlot: TimeSlot, reservations: Reservation[]): Date[] {
    const points = new Set<number>()
    
    // Add the requested time slot boundaries
    points.add(timeSlot.start.getTime())
    points.add(timeSlot.end.getTime())
    
    // Add all reservation boundaries that might overlap
    reservations.forEach(reservation => {
      points.add(reservation.timeSlot.start.getTime())
      points.add(reservation.timeSlot.end.getTime())
    })
    
    return Array.from(points)
      .sort((a, b) => a - b)
      .map(time => new Date(time))
      .filter(date => date >= timeSlot.start && date <= timeSlot.end)
  }

  // ===== DEMO DATA GENERATOR (for testing) =====
  
  static generateDemoReservations(stationId: number | string, stationName: string): void {
    const demoReservations: Reservation[] = [
      {
        id: 'demo_1',
        stationId,
        stationName,
        timeSlot: {
          start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          end: new Date(Date.now() + 4 * 60 * 60 * 1000)    // 4 hours from now
        },
        chargerCount: 2,
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedCost: 25.50
      },
      {
        id: 'demo_2',
        stationId,
        stationName,
        timeSlot: {
          start: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
          end: new Date(Date.now() + 8 * 60 * 60 * 1000)    // 8 hours from now
        },
        chargerCount: 1,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedCost: 12.75
      }
    ]

    const existing = this.getAllReservations()
    const filtered = existing.filter(r => r.stationId !== stationId)
    this.saveReservations([...filtered, ...demoReservations])
  }

  // Clear all reservations (for testing)
  static clearAllReservations(): void {
    localStorage.removeItem(RESERVATIONS_STORAGE_KEY)
  }
} 