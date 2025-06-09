import { test, expect } from '@playwright/test'

test.describe('Statistics API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display statistics dashboard with authenticated access', async ({ page }) => {
    // Mock successful statistics API response
    await page.route('**/station/api/statistics/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalCost: 125.50,
          totalKwh: 250.75,
          totalSessions: 15,
          co2Saved: 45.2
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
    
    // Should display statistics
    await expect(page.locator('text=Statistics')).toBeVisible()
    await expect(page.locator('text=€125.50')).toBeVisible()
    await expect(page.locator('text=250.75 kWh')).toBeVisible()
    await expect(page.locator('text=15')).toBeVisible()
    await expect(page.locator('text=45.2 kg')).toBeVisible()
  })

  test('should handle 403 unauthorized error with Portuguese message', async ({ page }) => {
    // Mock 403 unauthorized API response
    await page.route('**/station/api/statistics/**', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized access',
          message: 'Authentication required'
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
    
    // Should display Portuguese unauthorized message
    await expect(page.locator('text=Acesso negado')).toBeVisible()
    await expect(page.locator('text=Você precisa estar autenticado para visualizar as estatísticas')).toBeVisible()
    await expect(page.locator('text=Tentar Novamente')).toBeVisible()
  })

  test('should retry statistics API on 403 error', async ({ page }) => {
    let requestCount = 0
    
    // Mock first request as 403, second as success
    await page.route('**/station/api/statistics/**', route => {
      requestCount++
      if (requestCount === 1) {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' })
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalCost: 89.25,
            totalKwh: 178.50,
            totalSessions: 12,
            co2Saved: 35.7
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
    
    // Should show 403 error first
    await expect(page.locator('text=Acesso negado')).toBeVisible()
    
    // Click retry button
    await page.click('text=Tentar Novamente')
    
    // Should now show statistics
    await expect(page.locator('text=€89.25')).toBeVisible()
    await expect(page.locator('text=178.50 kWh')).toBeVisible()
  })

  test('should display loading state during statistics fetch', async ({ page }) => {
    // Mock delayed API response
    await page.route('**/station/api/statistics/**', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalCost: 150.00,
            totalKwh: 300.00,
            totalSessions: 20,
            co2Saved: 60.0
          })
        })
      }, 1000)
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should show loading state
    await expect(page.locator('text=Loading...')).toBeVisible()
    
    // Should eventually show statistics
    await expect(page.locator('text=€150.00')).toBeVisible({ timeout: 2000 })
  })

  test('should display monthly historical data charts', async ({ page }) => {
    // Mock monthly statistics API
    await page.route('**/station/api/statistics/monthly**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { month: '2024-01', totalCost: 45.50, totalSessions: 8 },
          { month: '2024-02', totalCost: 62.25, totalSessions: 12 },
          { month: '2024-03', totalCost: 78.90, totalSessions: 15 }
        ])
      })
    })

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should display chart components
    await expect(page.locator('[data-testid="monthly-chart"], .recharts-wrapper')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/station/api/statistics/**', route => route.abort())

    // Login first
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should display error message
    await expect(page.locator('text=Error loading statistics')).toBeVisible()
  })

  test('should display statistics for different user roles', async ({ page }) => {
    // Mock operator user statistics
    await page.route('**/station/api/statistics/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalCost: 1250.75,
          totalKwh: 2500.50,
          totalSessions: 150,
          co2Saved: 450.2,
          operatorData: {
            stationsManaged: 5,
            totalRevenue: 5000.00
          }
        })
      })
    })

    // Login as operator
    await page.click('a[href="/login"]')
    await page.fill('input[name="emailOrUsername"]', 'operator@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    
    // Should display operator-specific statistics
    await expect(page.locator('text=€1,250.75')).toBeVisible()
    await expect(page.locator('text=€5,000.00')).toBeVisible()
    await expect(page.locator('text=5 stations')).toBeVisible()
  })
})