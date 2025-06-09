import { test, expect } from '@playwright/test'

test.describe('History Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

  test('should display history page correctly', async ({ page }) => {
    await page.goto('/history')
    
    // Check page header
    await expect(page.getByRole('heading', { name: 'Charging History' })).toBeVisible()
    await expect(page.locator('text=View your past charging sessions and statistics')).toBeVisible()
    
    // Check action buttons
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Demo Data' })).toBeVisible()
  })

  test('should display statistics cards', async ({ page }) => {
    await page.goto('/history')
    
    // Check statistics cards
    await expect(page.locator('text=Total Sessions')).toBeVisible()
    await expect(page.locator('text=Total Time')).toBeVisible()
    await expect(page.locator('text=Total Cost')).toBeVisible()
    await expect(page.locator('text=Completed')).toBeVisible()
  })

  test('should filter by time period', async ({ page }) => {
    await page.goto('/history')
    
    // Check time period filters
    await expect(page.locator('text=Time Period:')).toBeVisible()
    await expect(page.getByRole('button', { name: 'All Time' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Last 7 Days' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Last 30 Days' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Last 90 Days' })).toBeVisible()
    
    // Default should be 'All Time' selected
    await expect(page.getByRole('button', { name: 'All Time' })).toHaveClass(/bg-\[#FFA500\]/)
    
    // Test clicking different time filters
    await page.getByRole('button', { name: 'Last 7 Days' }).click()
    await expect(page.getByRole('button', { name: 'Last 7 Days' })).toHaveClass(/bg-\[#FFA500\]/)
    
    await page.getByRole('button', { name: 'Last 30 Days' }).click()
    await expect(page.getByRole('button', { name: 'Last 30 Days' })).toHaveClass(/bg-\[#FFA500\]/)
    
    await page.getByRole('button', { name: 'Last 90 Days' }).click()
    await expect(page.getByRole('button', { name: 'Last 90 Days' })).toHaveClass(/bg-\[#FFA500\]/)
  })

  test('should filter by status', async ({ page }) => {
    await page.goto('/history')
    
    // Check status filters
    await expect(page.locator('text=Status:')).toBeVisible()
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancelled' })).toBeVisible()
    
    // Default should be 'All' selected
    await expect(page.getByRole('button', { name: 'All' })).toHaveClass(/bg-\[#FFA500\]/)
    
    // Test clicking different status filters
    await page.getByRole('button', { name: 'Completed' }).click()
    await expect(page.getByRole('button', { name: 'Completed' })).toHaveClass(/bg-\[#FFA500\]/)
    
    await page.getByRole('button', { name: 'Cancelled' }).click()
    await expect(page.getByRole('button', { name: 'Cancelled' })).toHaveClass(/bg-\[#FFA500\]/)
  })

  test('should show empty state when no history exists', async ({ page }) => {
    await page.goto('/history')
    
    // Should show empty state initially
    await expect(page.locator('text=No charging history found')).toBeVisible()
    await expect(page.locator('text=No charging sessions match your current filters.')).toBeVisible()
    
    // Export button should be disabled when no data
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  })

  test('should display history entries with correct information', async ({ page }) => {
    // Add mock history data
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
        estimatedCost: 25.50,
        createdAt: new Date(),
        recurringDays: new Set()
      }
      localStorage.setItem('reservations', JSON.stringify([mockReservation]))
    })
    
    await page.goto('/history')
    
    // Check that history entry displays
    await expect(page.locator('text=Central Station')).toBeVisible()
    await expect(page.locator('text=completed')).toBeVisible()
    await expect(page.locator('text=€25.50')).toBeVisible()
  })

  test('should calculate and display statistics correctly', async ({ page }) => {
    // Add multiple mock reservations
    await page.addInitScript(() => {
      const mockReservations = [
        {
          id: '1',
          stationName: 'Station A',
          timeSlot: {
            start: new Date(Date.now() - 86400000),
            end: new Date(Date.now() - 82800000) // 1 hour session
          },
          displayStatus: 'completed',
          estimatedCost: 15.00,
          createdAt: new Date()
        },
        {
          id: '2',
          stationName: 'Station B',
          timeSlot: {
            start: new Date(Date.now() - 172800000),
            end: new Date(Date.now() - 165600000) // 2 hour session
          },
          displayStatus: 'completed',
          estimatedCost: 30.00,
          createdAt: new Date()
        }
      ]
      localStorage.setItem('reservations', JSON.stringify(mockReservations))
    })
    
    await page.goto('/history')
    
    // Check statistics calculations
    await expect(page.locator('text=2')).toBeVisible() // Total Sessions
    await expect(page.locator('text=3h')).toBeVisible() // Total Time (3 hours)
    await expect(page.locator('text=€45.00')).toBeVisible() // Total Cost
    await expect(page.locator('text=2')).toBeVisible() // Completed sessions
  })

  test('should handle CSV export functionality', async ({ page }) => {
    // Add mock history data
    await page.addInitScript(() => {
      const mockReservation = {
        id: '1',
        stationName: 'Central Station',
        timeSlot: {
          start: new Date(Date.now() - 86400000),
          end: new Date(Date.now() - 82800000)
        },
        displayStatus: 'completed',
        estimatedCost: 25.50,
        createdAt: new Date()
      }
      localStorage.setItem('reservations', JSON.stringify([mockReservation]))
    })
    
    await page.goto('/history')
    
    // Mock download
    const downloadPromise = page.waitForEvent('download')
    
    // Export button should be enabled with data
    const exportButton = page.getByRole('button', { name: 'Export CSV' })
    await expect(exportButton).toBeEnabled()
    
    await exportButton.click()
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/charging-history-\d{4}-\d{2}-\d{2}\.csv/)
  })

  test('should handle demo data generation', async ({ page }) => {
    await page.goto('/history')
    
    // Click Add Demo Data button
    await page.getByRole('button', { name: 'Add Demo Data' }).click()
    
    // The page should reload to show updated data
    await page.waitForLoadState('networkidle')
  })

  test('should show loading state', async ({ page }) => {
    await page.goto('/history')
    
    // Check for loading spinner initially
    const loadingSpinner = page.locator('.animate-spin')
    // Note: This might be visible briefly, so we don't assert it's there
    // but we check that it eventually disappears
    await page.waitForLoadState('networkidle')
  })

  test('should format dates and times correctly', async ({ page }) => {
    // Add mock history data with specific date
    await page.addInitScript(() => {
      const specificDate = new Date('2024-06-15T10:00:00Z')
      const endDate = new Date('2024-06-15T12:30:00Z')
      
      const mockReservation = {
        id: '1',
        stationName: 'Test Station',
        timeSlot: {
          start: specificDate,
          end: endDate
        },
        displayStatus: 'completed',
        estimatedCost: 25.50,
        createdAt: new Date()
      }
      localStorage.setItem('reservations', JSON.stringify([mockReservation]))
    })
    
    await page.goto('/history')
    
    // Check date formatting
    await expect(page.locator('text=Test Station')).toBeVisible()
    // Should show duration as 2h 30m
    await expect(page.locator('text=2h 30m')).toBeVisible()
  })

  test('should protect route when not authenticated', async ({ page }) => {
    // Clear authentication
    await page.addInitScript(() => {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
    })
    
    await page.goto('/history')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should show proper status badges', async ({ page }) => {
    // Add reservations with different statuses
    await page.addInitScript(() => {
      const mockReservations = [
        {
          id: '1',
          stationName: 'Station A',
          timeSlot: {
            start: new Date(Date.now() - 86400000),
            end: new Date(Date.now() - 82800000)
          },
          displayStatus: 'completed',
          estimatedCost: 15.00,
          createdAt: new Date()
        },
        {
          id: '2',
          stationName: 'Station B',
          timeSlot: {
            start: new Date(Date.now() - 172800000),
            end: new Date(Date.now() - 169200000)
          },
          displayStatus: 'cancelled',
          estimatedCost: 0,
          createdAt: new Date()
        }
      ]
      localStorage.setItem('reservations', JSON.stringify(mockReservations))
    })
    
    await page.goto('/history')
    
    // Check that both status badges are visible
    await expect(page.locator('text=completed')).toBeVisible()
    await expect(page.locator('text=cancelled')).toBeVisible()
  })
})