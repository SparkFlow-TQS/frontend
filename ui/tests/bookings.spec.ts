import { test, expect } from '@playwright/test'

test.describe('Bookings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting localStorage token
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'DRIVER'
      }))
    })
  })

  test('should display bookings page correctly', async ({ page }) => {
    await page.goto('/bookings')
    
    // Check page header
    await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible()
    await expect(page.locator('text=Manage your charging station reservations')).toBeVisible()
    
    // Check filter tabs
    await expect(page.getByRole('button', { name: 'All Bookings' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Upcoming' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancelled' })).toBeVisible()
    
    // Check action buttons
    await expect(page.getByRole('button', { name: 'Add Demo Data' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Clear All' })).toBeVisible()
  })

  test('should filter bookings by status', async ({ page }) => {
    await page.goto('/bookings')
    
    // Default should be 'All Bookings' selected
    const allBookingsTab = page.getByRole('button', { name: 'All Bookings' })
    await expect(allBookingsTab).toHaveClass(/bg-\[#FFA500\]/)
    
    // Click on Upcoming filter
    await page.getByRole('button', { name: 'Upcoming' }).click()
    await expect(page.getByRole('button', { name: 'Upcoming' })).toHaveClass(/bg-\[#FFA500\]/)
    
    // Click on Completed filter
    await page.getByRole('button', { name: 'Completed' }).click()
    await expect(page.getByRole('button', { name: 'Completed' })).toHaveClass(/bg-\[#FFA500\]/)
    
    // Click on Cancelled filter
    await page.getByRole('button', { name: 'Cancelled' }).click()
    await expect(page.getByRole('button', { name: 'Cancelled' })).toHaveClass(/bg-\[#FFA500\]/)
  })

  test('should show empty state when no bookings exist', async ({ page }) => {
    await page.goto('/bookings')
    
    // Should show empty state initially
    await expect(page.locator('text=No bookings found')).toBeVisible()
    await expect(page.locator('text=You haven\'t made any charging station reservations yet.')).toBeVisible()
    
    // Check quick action buttons in empty state
    await expect(page.getByRole('link', { name: 'Book a Charging Session' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Demo Data' })).toBeVisible()
  })

  test('should handle demo data generation', async ({ page }) => {
    await page.goto('/bookings')
    
    // Click Add Demo Data button
    await page.getByRole('button', { name: 'Add Demo Data' }).click()
    
    // The page should reload to show updated data
    await page.waitForLoadState('networkidle')
  })

  test('should handle clear all functionality', async ({ page }) => {
    await page.goto('/bookings')
    
    // Click Clear All button
    await page.getByRole('button', { name: 'Clear All' }).click()
    
    // Should show confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to clear all bookings?')
      await dialog.accept()
    })
    
    await page.waitForLoadState('networkidle')
  })

  test('should display booking cards with correct information', async ({ page }) => {
    // Add mock reservation data to localStorage before navigation
    await page.addInitScript(() => {
      const mockReservation = {
        id: '1',
        stationId: 'station-1',
        stationName: 'Central Station',
        timeSlot: {
          start: new Date(Date.now() + 86400000), // Tomorrow
          end: new Date(Date.now() + 90000000)
        },
        chargerCount: 2,
        displayStatus: 'confirmed',
        estimatedCost: 25.50,
        createdAt: new Date(),
        recurringDays: new Set()
      }
      localStorage.setItem('reservations', JSON.stringify([mockReservation]))
    })
    
    await page.goto('/bookings')
    
    // Check that booking card displays
    await expect(page.locator('text=Central Station')).toBeVisible()
    await expect(page.locator('text=confirmed')).toBeVisible()
    await expect(page.locator('text=2 charger(s)')).toBeVisible()
    await expect(page.locator('text=€25.50')).toBeVisible()
  })

  test('should allow cancelling a booking', async ({ page }) => {
    // Add mock reservation data
    await page.addInitScript(() => {
      const mockReservation = {
        id: '1',
        stationId: 'station-1',
        stationName: 'Central Station',
        timeSlot: {
          start: new Date(Date.now() + 86400000),
          end: new Date(Date.now() + 90000000)
        },
        chargerCount: 1,
        displayStatus: 'confirmed',
        estimatedCost: 25.50,
        createdAt: new Date(),
        recurringDays: new Set()
      }
      localStorage.setItem('reservations', JSON.stringify([mockReservation]))
    })
    
    await page.goto('/bookings')
    
    // Should show cancel button for active bookings
    const cancelButton = page.getByRole('button', { name: 'Cancel' })
    await expect(cancelButton).toBeVisible()
    
    // Mock confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to cancel this booking?')
      await dialog.accept()
    })
    
    await cancelButton.click()
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to station details', async ({ page }) => {
    // Add mock reservation data
    await page.addInitScript(() => {
      const mockReservation = {
        id: '1',
        stationId: 'station-1',
        stationName: 'Central Station',
        timeSlot: {
          start: new Date(),
          end: new Date(Date.now() + 3600000)
        },
        chargerCount: 1,
        displayStatus: 'confirmed',
        createdAt: new Date(),
        recurringDays: new Set()
      }
      localStorage.setItem('reservations', JSON.stringify([mockReservation]))
    })
    
    await page.goto('/bookings')
    
    // Click View Station button
    const viewStationButton = page.getByRole('link', { name: 'View Station' })
    await expect(viewStationButton).toBeVisible()
    await expect(viewStationButton).toHaveAttribute('href', '/stations/station-1')
  })

  test('should display quick actions section', async ({ page }) => {
    await page.goto('/bookings')
    
    // Check quick actions section
    await expect(page.locator('text=Quick Actions')).toBeVisible()
    
    // Check action buttons
    const newBookingLink = page.getByRole('link', { name: 'New Booking' })
    const findStationsLink = page.getByRole('link', { name: 'Find Stations' })
    const viewHistoryLink = page.getByRole('link', { name: 'View History' })
    
    await expect(newBookingLink).toBeVisible()
    await expect(newBookingLink).toHaveAttribute('href', '/schedule')
    
    await expect(findStationsLink).toBeVisible()
    await expect(findStationsLink).toHaveAttribute('href', '/map')
    
    await expect(viewHistoryLink).toBeVisible()
    await expect(viewHistoryLink).toHaveAttribute('href', '/history')
  })

  test('should show recurring badge for recurring bookings', async ({ page }) => {
    // Add mock recurring reservation
    await page.addInitScript(() => {
      const mockReservation = {
        id: '1',
        stationId: 'station-1',
        stationName: 'Central Station',
        timeSlot: {
          start: new Date(),
          end: new Date(Date.now() + 3600000)
        },
        chargerCount: 1,
        displayStatus: 'confirmed',
        createdAt: new Date(),
        recurringDays: new Set(['monday', 'wednesday', 'friday'])
      }
      localStorage.setItem('reservations', JSON.stringify([mockReservation]))
    })
    
    await page.goto('/bookings')
    
    // Should show recurring badge
    await expect(page.locator('text=Recurring')).toBeVisible()
  })

  test('should not show cancel button for completed/cancelled bookings', async ({ page }) => {
    // Add mock completed reservation
    await page.addInitScript(() => {
      const mockReservation = {
        id: '1',
        stationId: 'station-1',
        stationName: 'Central Station',
        timeSlot: {
          start: new Date(Date.now() - 86400000), // Yesterday
          end: new Date(Date.now() - 82800000)
        },
        chargerCount: 1,
        displayStatus: 'completed',
        createdAt: new Date(),
        recurringDays: new Set()
      }
      localStorage.setItem('reservations', JSON.stringify([mockReservation]))
    })
    
    await page.goto('/bookings')
    
    // Should not show cancel button for completed bookings
    await expect(page.getByRole('button', { name: 'Cancel' })).not.toBeVisible()
    await expect(page.locator('text=completed')).toBeVisible()
  })

  test('should protect route when not authenticated', async ({ page }) => {
    // Clear authentication
    await page.addInitScript(() => {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
    })
    
    await page.goto('/bookings')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})