import { test, expect } from '@playwright/test'

test.describe('Payments Page', () => {
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

  test('should display payments page correctly', async ({ page }) => {
    await page.goto('/payments')
    
    // Check page header
    await expect(page.getByRole('heading', { name: 'Payment Methods & Billing' })).toBeVisible()
    await expect(page.locator('text=Manage your payment methods and view transaction history')).toBeVisible()
    
    // Check sections
    await expect(page.locator('text=Payment Methods')).toBeVisible()
    await expect(page.locator('text=Recent Transactions')).toBeVisible()
    await expect(page.locator('text=Billing Summary')).toBeVisible()
    
    // Check action buttons
    await expect(page.getByRole('button', { name: 'Export Transactions' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Card' })).toBeVisible()
  })

  test('should show empty state for payment methods when none exist', async ({ page }) => {
    await page.goto('/payments')
    
    // Should show empty payment methods state
    await expect(page.locator('text=No payment methods')).toBeVisible()
    await expect(page.locator('text=Add a payment method to start charging')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Your First Card' })).toBeVisible()
  })

  test('should show empty state for transactions when none exist', async ({ page }) => {
    await page.goto('/payments')
    
    // Should show empty transactions state
    await expect(page.locator('text=No transactions yet')).toBeVisible()
    await expect(page.locator('text=Your charging transactions will appear here')).toBeVisible()
  })

  test('should display payment methods correctly', async ({ page }) => {
    await page.goto('/payments')
    
    // Demo data should load automatically
    await page.waitForLoadState('networkidle')
    
    // Check that payment method cards display
    await expect(page.locator('text=Visa •••• 4242')).toBeVisible()
    await expect(page.locator('text=Mastercard •••• 5555')).toBeVisible()
    
    // Check default badge
    await expect(page.locator('text=Default')).toBeVisible()
    
    // Check expiry dates
    await expect(page.locator('text=Expires 12/2025')).toBeVisible()
    await expect(page.locator('text=Expires 08/2026')).toBeVisible()
  })

  test('should display transactions correctly', async ({ page }) => {
    await page.goto('/payments')
    
    // Demo data should load automatically
    await page.waitForLoadState('networkidle')
    
    // Check that transaction entries display
    await expect(page.locator('text=Central Station')).toBeVisible()
    await expect(page.locator('text=Mall Parking')).toBeVisible()
    await expect(page.locator('text=Airport Terminal')).toBeVisible()
    
    // Check transaction amounts
    await expect(page.locator('text=€25.50')).toBeVisible()
    await expect(page.locator('text=€18.75')).toBeVisible()
    await expect(page.locator('text=€32.00')).toBeVisible()
    
    // Check status badges
    await expect(page.locator('text=completed')).toBeVisible()
    await expect(page.locator('text=pending')).toBeVisible()
  })

  test('should display billing summary correctly', async ({ page }) => {
    await page.goto('/payments')
    
    // Wait for demo data to load
    await page.waitForLoadState('networkidle')
    
    // Check billing summary calculations
    await expect(page.locator('text=Total Spent')).toBeVisible()
    await expect(page.locator('text=Completed Payments')).toBeVisible()
    await expect(page.locator('text=Average Per Session')).toBeVisible()
    
    // Check calculated values (€25.50 + €18.75 + €32.00 = €76.25)
    await expect(page.locator('text=€76.25')).toBeVisible()
  })

  test('should open add card form when clicking add card', async ({ page }) => {
    await page.goto('/payments')
    
    // Click Add Card button
    await page.getByRole('button', { name: 'Add Card' }).click()
    
    // Check that add card form appears
    await expect(page.locator('text=Add New Payment Method')).toBeVisible()
    await expect(page.getByLabel('Card Number')).toBeVisible()
    await expect(page.getByLabel('Expiry Date')).toBeVisible()
    await expect(page.getByLabel('CVC')).toBeVisible()
    await expect(page.getByLabel('Cardholder Name')).toBeVisible()
    
    // Check form buttons
    await expect(page.getByRole('button', { name: 'Add Card' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('should validate add card form', async ({ page }) => {
    await page.goto('/payments')
    
    // Open add card form
    await page.getByRole('button', { name: 'Add Card' }).click()
    
    // Fill out form with test data
    await page.getByLabel('Card Number').fill('4111111111111111')
    await page.getByLabel('Expiry Date').fill('12/25')
    await page.getByLabel('CVC').fill('123')
    await page.getByLabel('Cardholder Name').fill('Test User')
    
    // Submit form
    await page.getByRole('button', { name: 'Add Card' }).click()
    
    // Form should close and new card should appear
    await expect(page.locator('text=Add New Payment Method')).not.toBeVisible()
  })

  test('should cancel add card form', async ({ page }) => {
    await page.goto('/payments')
    
    // Open add card form
    await page.getByRole('button', { name: 'Add Card' }).click()
    
    // Click Cancel button
    await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Form should close
    await expect(page.locator('text=Add New Payment Method')).not.toBeVisible()
  })

  test('should handle setting default payment method', async ({ page }) => {
    await page.goto('/payments')
    
    // Wait for demo data to load
    await page.waitForLoadState('networkidle')
    
    // Find and click "Set Default" button on non-default card
    const setDefaultButton = page.getByRole('button', { name: 'Set Default' })
    await expect(setDefaultButton).toBeVisible()
    
    await setDefaultButton.click()
    
    // The button should disappear and Default badge should move
    await page.waitForLoadState('networkidle')
  })

  test('should handle deleting payment method', async ({ page }) => {
    await page.goto('/payments')
    
    // Wait for demo data to load
    await page.waitForLoadState('networkidle')
    
    // Mock confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to remove this payment method?')
      await dialog.accept()
    })
    
    // Click delete button (trash icon)
    const deleteButtons = page.locator('button').filter({ hasText: /^$/ }).filter({ has: page.locator('svg') })
    await deleteButtons.first().click()
    
    await page.waitForLoadState('networkidle')
  })

  test('should handle transaction export', async ({ page }) => {
    await page.goto('/payments')
    
    // Wait for demo data to load
    await page.waitForLoadState('networkidle')
    
    // Mock download
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button
    await page.getByRole('button', { name: 'Export Transactions' }).click()
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/payment-history-\d{4}-\d{2}-\d{2}\.csv/)
  })

  test('should format transaction dates correctly', async ({ page }) => {
    await page.goto('/payments')
    
    // Wait for demo data to load
    await page.waitForLoadState('networkidle')
    
    // Check that dates are formatted properly
    await expect(page.locator('text=Jun 8, 2024')).toBeVisible()
    await expect(page.locator('text=Jun 5, 2024')).toBeVisible()
    await expect(page.locator('text=Jun 3, 2024')).toBeVisible()
  })

  test('should show correct status colors for transactions', async ({ page }) => {
    await page.goto('/payments')
    
    // Wait for demo data to load
    await page.waitForLoadState('networkidle')
    
    // Check that different status badges have different styling
    const completedBadges = page.locator('.bg-green-100')
    const pendingBadges = page.locator('.bg-yellow-100')
    
    await expect(completedBadges).toHaveCount(2) // 2 completed transactions
    await expect(pendingBadges).toHaveCount(1) // 1 pending transaction
  })

  test('should show payment method icons correctly', async ({ page }) => {
    await page.goto('/payments')
    
    // Wait for demo data to load
    await page.waitForLoadState('networkidle')
    
    // Check that credit card icons are displayed
    const cardIcons = page.locator('svg[data-icon="credit-card"], .fa-credit-card')
    await expect(cardIcons.first()).toBeVisible()
  })

  test('should protect route when not authenticated', async ({ page }) => {
    // Clear authentication
    await page.addInitScript(() => {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
    })
    
    await page.goto('/payments')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should handle form validation for empty fields', async ({ page }) => {
    await page.goto('/payments')
    
    // Open add card form
    await page.getByRole('button', { name: 'Add Card' }).click()
    
    // Try to submit empty form
    const addCardButton = page.getByRole('button', { name: 'Add Card' }).nth(1) // The submit button
    
    // Form fields should be required
    await expect(page.getByLabel('Card Number')).toHaveAttribute('required')
    await expect(page.getByLabel('Expiry Date')).toHaveAttribute('required')
    await expect(page.getByLabel('CVC')).toHaveAttribute('required')
    await expect(page.getByLabel('Cardholder Name')).toHaveAttribute('required')
  })

  test('should show correct billing summary when no transactions', async ({ page }) => {
    // Mock empty transactions
    await page.addInitScript(() => {
      // Override the demo data loading to return empty arrays
      window.mockEmptyData = true
    })
    
    await page.goto('/payments')
    
    // When no transactions, billing summary should show zeros
    await expect(page.locator('text=€0.00')).toBeVisible()
  })
})