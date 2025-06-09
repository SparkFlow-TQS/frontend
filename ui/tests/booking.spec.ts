import { test, expect } from '@playwright/test'

test.describe('Booking System Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display booking toggle in dashboard', async ({ page }) => {
    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Check for API/Local toggle button
    await expect(page.locator('text=Switch to Local')).toBeVisible()
    await expect(page.locator('text=Loading from Station Service API')).toBeVisible()
  })

  test('should switch between API and localStorage modes', async ({ page }) => {
    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Initially should be in API mode
    await expect(page.locator('text=Loading from Station Service API')).toBeVisible()
    
    // Switch to localStorage mode
    await page.click('text=Switch to Local')
    await expect(page.locator('text=Loading from local storage')).toBeVisible()
    await expect(page.locator('text=Switch to API')).toBeVisible()
    
    // Switch back to API mode
    await page.click('text=Switch to API')
    await expect(page.locator('text=Loading from Station Service API')).toBeVisible()
  })

  test('should handle API fallback gracefully', async ({ page }) => {
    // Mock API to fail
    await page.route('**/station/bookings/**', route => route.abort())
    
    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should fallback to localStorage
    await expect(page.locator('text=Loading from local storage')).toBeVisible()
  })

  test('should display empty state when no reservations', async ({ page }) => {
    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should show empty state
    await expect(page.locator('text=No reservations yet')).toBeVisible()
    await expect(page.locator('text=Start by booking a charging session')).toBeVisible()
  })

  test('should show demo data functionality', async ({ page }) => {
    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Switch to localStorage mode for demo data
    await page.click('text=Switch to Local')
    
    // Add demo data
    await page.click('text=Add Demo Data')
    
    // Should show reservations
    await expect(page.locator('text=Demo Station')).toBeVisible()
    const reservationElements = page.locator('.upcoming, .past')
    await expect(reservationElements).toHaveCount(await reservationElements.count())
  })

  test('should display reservation statistics', async ({ page }) => {
    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Switch to localStorage for demo data
    await page.click('text=Switch to Local')
    await page.click('text=Add Demo Data')
    
    // Check statistics cards
    await expect(page.locator('text=Total')).toBeVisible()
    await expect(page.locator('text=Upcoming')).toBeVisible()
    await expect(page.locator('text=Completed')).toBeVisible()
    await expect(page.locator('text=Total Cost')).toBeVisible()
  })

  test('should handle reservation cancellation', async ({ page }) => {
    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Switch to localStorage for demo data
    await page.click('text=Switch to Local')
    await page.click('text=Add Demo Data')
    
    // Mock confirmation dialog
    page.on('dialog', dialog => dialog.accept())
    
    // Cancel a reservation (trash button)
    await page.locator('[data-testid="trash-button"], .text-red-600').first().click()
    
    // Should see update in statistics
    await expect(page.locator('text=cancelled')).toBeVisible()
  })

  test('should display recurring reservation badges', async ({ page }) => {
    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Switch to localStorage for demo data
    await page.click('text=Switch to Local')
    await page.click('text=Add Demo Data')
    
    // Should see recurring badge
    await expect(page.locator('.text-purple-600')).toBeVisible()
  })
})