import { test, expect } from '@playwright/test'

test.describe('Station Service API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should create new booking via station-service API', async ({ page }) => {
    // Mock booking creation API
    await page.route('**/station/bookings', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'booking-123',
            stationId: 'station-001',
            userId: 'user-123',
            startTime: '2024-06-10T10:00:00Z',
            endTime: '2024-06-10T12:00:00Z',
            status: 'confirmed'
          })
        })
      }
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to schedule page
    await page.click('a[href="/schedule"]')
    
    // Fill booking form
    await page.selectOption('select[name="stationId"]', 'station-001')
    await page.fill('input[name="date"]', '2024-06-10')
    await page.fill('input[name="startTime"]', '10:00')
    await page.fill('input[name="endTime"]', '12:00')
    
    // Submit booking
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=Booking created successfully')).toBeVisible()
  })

  test('should handle booking API authentication errors', async ({ page }) => {
    // Mock 401 unauthorized response
    await page.route('**/station/bookings**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        })
      })
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should redirect to login on 401
    await expect(page).toHaveURL('/login')
  })

  test('should handle booking cancellation via API', async ({ page }) => {
    // Mock get bookings API
    await page.route('**/station/bookings/user/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'booking-123',
            stationId: 'station-001',
            stationName: 'Test Station',
            startTime: '2024-06-10T10:00:00Z',
            endTime: '2024-06-10T12:00:00Z',
            status: 'confirmed'
          }
        ])
      })
    })

    // Mock cancellation API
    await page.route('**/station/bookings/booking-123/cancel', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'booking-123',
            status: 'cancelled'
          })
        })
      }
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Mock confirmation dialog
    page.on('dialog', dialog => dialog.accept())
    
    // Cancel booking
    await page.locator('[data-testid="cancel-booking"], button:has-text("Cancel")').first().click()
    
    // Should show cancellation success
    await expect(page.locator('text=Booking cancelled successfully')).toBeVisible()
  })

  test('should handle recurring booking creation', async ({ page }) => {
    // Mock recurring booking API
    await page.route('**/station/bookings/recurring', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'recurring-123',
            bookings: [
              { id: 'booking-1', startTime: '2024-06-10T10:00:00Z' },
              { id: 'booking-2', startTime: '2024-06-17T10:00:00Z' },
              { id: 'booking-3', startTime: '2024-06-24T10:00:00Z' }
            ]
          })
        })
      }
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to schedule page
    await page.click('a[href="/schedule"]')
    
    // Enable recurring booking
    await page.check('input[name="isRecurring"]')
    await page.selectOption('select[name="recurringPattern"]', 'weekly')
    await page.fill('input[name="recurringCount"]', '3')
    
    // Fill booking details
    await page.selectOption('select[name="stationId"]', 'station-001')
    await page.fill('input[name="date"]', '2024-06-10')
    await page.fill('input[name="startTime"]', '10:00')
    await page.fill('input[name="endTime"]', '12:00')
    
    // Submit recurring booking
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=Recurring booking created successfully')).toBeVisible()
  })

  test('should fallback to localStorage when API fails', async ({ page }) => {
    // Mock API failure
    await page.route('**/station/bookings/**', route => route.abort())

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should automatically fallback to localStorage
    await expect(page.locator('text=Loading from local storage')).toBeVisible()
    await expect(page.locator('text=Switch to API')).toBeVisible()
  })

  test('should validate booking availability via API', async ({ page }) => {
    // Mock availability check API
    await page.route('**/station/bookings/station/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'existing-booking',
            startTime: '2024-06-10T09:00:00Z',
            endTime: '2024-06-10T11:00:00Z',
            status: 'confirmed'
          }
        ])
      })
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to schedule page
    await page.click('a[href="/schedule"]')
    
    // Try to book conflicting time
    await page.selectOption('select[name="stationId"]', 'station-001')
    await page.fill('input[name="date"]', '2024-06-10')
    await page.fill('input[name="startTime"]', '10:00')
    await page.fill('input[name="endTime"]', '12:00')
    
    // Submit booking
    await page.click('button[type="submit"]')
    
    // Should show conflict error
    await expect(page.locator('text=Time slot unavailable')).toBeVisible()
  })

  test('should include JWT token in API requests', async ({ page }) => {
    let authorizationHeader = ''
    
    // Capture Authorization header
    await page.route('**/station/bookings/**', route => {
      authorizationHeader = route.request().headers()['authorization'] || ''
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard (triggers API call)
    await page.click('a[href="/dashboard"]')
    
    // Wait for API call
    await page.waitForTimeout(1000)
    
    // Should include Bearer token
    expect(authorizationHeader).toMatch(/^Bearer .+/)
  })

  test('should handle API rate limiting gracefully', async ({ page }) => {
    // Mock 429 rate limit response
    await page.route('**/station/bookings/**', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later'
        })
      })
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should show rate limit message
    await expect(page.locator('text=Too many requests')).toBeVisible()
    await expect(page.locator('text=Please try again later')).toBeVisible()
  })
})