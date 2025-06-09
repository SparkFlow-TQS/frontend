import { test, expect } from '@playwright/test'

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication with user data
    await page.addInitScript(() => {
      const mockUserData = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'DRIVER',
        isOperator: false
      }
      
      localStorage.setItem('auth-token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify(mockUserData))
      
      // Mock AuthContext
      ;(window as any).mockUser = mockUserData
    })
  })

  test('should display profile page correctly', async ({ page }) => {
    await page.goto('/profile')
    
    // Check page header
    await expect(page.getByRole('heading', { name: 'Profile Settings' })).toBeVisible()
    await expect(page.locator('text=Manage your account information and preferences')).toBeVisible()
    
    // Check sections
    await expect(page.locator('text=Profile Information')).toBeVisible()
    await expect(page.locator('text=Account Summary')).toBeVisible()
    await expect(page.locator('text=Environmental Impact')).toBeVisible()
    await expect(page.locator('text=Quick Actions')).toBeVisible()
    
    // Check Edit Profile button
    await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible()
  })

  test('should display user information correctly', async ({ page }) => {
    await page.goto('/profile')
    
    // Check that user data is displayed
    await expect(page.locator('input[value="testuser"]')).toBeVisible()
    await expect(page.locator('input[value="test@example.com"]')).toBeVisible()
    
    // Check account type badge for driver
    await expect(page.locator('text=Driver')).toBeVisible()
    
    // Form fields should be disabled initially
    await expect(page.getByLabel('Username')).toBeDisabled()
    await expect(page.getByLabel('Email Address')).toBeDisabled()
  })

  test('should display operator badge for operator users', async ({ page }) => {
    // Override user data to be an operator
    await page.addInitScript(() => {
      (window as any).mockUser = {
        id: '1',
        username: 'operatoruser',
        email: 'operator@example.com',
        role: 'OPERATOR',
        isOperator: true
      }
    })
    
    await page.goto('/profile')
    
    // Check that operator badge is displayed
    await expect(page.locator('text=Station Operator')).toBeVisible()
  })

  test('should enter edit mode when clicking Edit Profile', async ({ page }) => {
    await page.goto('/profile')
    
    // Click Edit Profile button
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Edit Profile button should disappear
    await expect(page.getByRole('button', { name: 'Edit Profile' })).not.toBeVisible()
    
    // Form fields should become enabled
    await expect(page.getByLabel('Username')).toBeEnabled()
    await expect(page.getByLabel('Email Address')).toBeEnabled()
    
    // Password fields should appear
    await expect(page.getByLabel('Current Password')).toBeVisible()
    await expect(page.getByLabel('New Password')).toBeVisible()
    await expect(page.getByLabel('Confirm New Password')).toBeVisible()
    
    // Save and Cancel buttons should appear
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('should save profile changes successfully', async ({ page }) => {
    await page.goto('/profile')
    
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Change username
    await page.getByLabel('Username').fill('newusername')
    await page.getByLabel('Email Address').fill('newemail@example.com')
    
    // Submit form
    await page.getByRole('button', { name: 'Save Changes' }).click()
    
    // Should show loading state
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeVisible()
    
    // Wait for success message
    await expect(page.locator('text=Profile updated successfully!')).toBeVisible()
    
    // Should exit edit mode
    await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible()
    
    // Fields should be disabled again
    await expect(page.getByLabel('Username')).toBeDisabled()
  })

  test('should cancel edit mode', async ({ page }) => {
    await page.goto('/profile')
    
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Make changes
    await page.getByLabel('Username').fill('changedusername')
    
    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Should exit edit mode
    await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible()
    
    // Changes should be reverted
    await expect(page.locator('input[value="testuser"]')).toBeVisible()
    await expect(page.locator('input[value="changedusername"]')).not.toBeVisible()
  })

  test('should validate password change', async ({ page }) => {
    await page.goto('/profile')
    
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Try to change password with mismatched confirmation
    await page.getByLabel('Current Password').fill('currentpass')
    await page.getByLabel('New Password').fill('newpass123')
    await page.getByLabel('Confirm New Password').fill('differentpass')
    
    // Submit form
    await page.getByRole('button', { name: 'Save Changes' }).click()
    
    // Should show error message
    await expect(page.locator('text=New passwords do not match')).toBeVisible()
  })

  test('should validate password length', async ({ page }) => {
    await page.goto('/profile')
    
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Try to set password that's too short
    await page.getByLabel('Current Password').fill('currentpass')
    await page.getByLabel('New Password').fill('123')
    await page.getByLabel('Confirm New Password').fill('123')
    
    // Submit form
    await page.getByRole('button', { name: 'Save Changes' }).click()
    
    // Should show error message
    await expect(page.locator('text=Password must be at least 6 characters long')).toBeVisible()
  })

  test('should require current password when changing password', async ({ page }) => {
    await page.goto('/profile')
    
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Try to change password without providing current password
    await page.getByLabel('New Password').fill('newpass123')
    await page.getByLabel('Confirm New Password').fill('newpass123')
    
    // Submit form
    await page.getByRole('button', { name: 'Save Changes' }).click()
    
    // Should show error message
    await expect(page.locator('text=Current password is required to change password')).toBeVisible()
  })

  test('should display account statistics correctly', async ({ page }) => {
    await page.goto('/profile')
    
    // Check account summary statistics
    await expect(page.locator('text=45')).toBeVisible() // Total Sessions
    await expect(page.locator('text=€234.5')).toBeVisible() // Total Spent
    await expect(page.locator('text=Central Station')).toBeVisible() // Favorite Station
    await expect(page.locator('text=March 2024')).toBeVisible() // Member Since
    
    // Check environmental impact
    await expect(page.locator('text=678.5 kWh')).toBeVisible() // Total Energy Used
    await expect(page.locator('text=152.3 kg')).toBeVisible() // CO₂ Emissions Saved
    await expect(page.locator('text=Compared to equivalent gasoline vehicle usage')).toBeVisible()
  })

  test('should navigate to other pages via quick actions', async ({ page }) => {
    await page.goto('/profile')
    
    // Check quick action buttons
    const bookingsButton = page.getByRole('button', { name: 'View My Bookings' })
    const paymentsButton = page.getByRole('button', { name: 'Payment Methods' })
    const historyButton = page.getByRole('button', { name: 'Charging History' })
    
    await expect(bookingsButton).toBeVisible()
    await expect(paymentsButton).toBeVisible()
    await expect(historyButton).toBeVisible()
    
    // Test navigation (these would normally redirect)
    await bookingsButton.click()
    await page.waitForURL('/bookings')
  })

  test('should handle successful password change', async ({ page }) => {
    await page.goto('/profile')
    
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Change password correctly
    await page.getByLabel('Current Password').fill('currentpass')
    await page.getByLabel('New Password').fill('newpass123')
    await page.getByLabel('Confirm New Password').fill('newpass123')
    
    // Submit form
    await page.getByRole('button', { name: 'Save Changes' }).click()
    
    // Should show success message
    await expect(page.locator('text=Profile updated successfully!')).toBeVisible()
    
    // Password fields should be cleared
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    await expect(page.getByLabel('Current Password')).toHaveValue('')
    await expect(page.getByLabel('New Password')).toHaveValue('')
    await expect(page.getByLabel('Confirm New Password')).toHaveValue('')
  })

  test('should show password change section only in edit mode', async ({ page }) => {
    await page.goto('/profile')
    
    // Password fields should not be visible initially
    await expect(page.getByLabel('Current Password')).not.toBeVisible()
    await expect(page.getByLabel('New Password')).not.toBeVisible()
    await expect(page.getByLabel('Confirm New Password')).not.toBeVisible()
    
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Password fields should appear
    await expect(page.getByLabel('Current Password')).toBeVisible()
    await expect(page.getByLabel('New Password')).toBeVisible()
    await expect(page.getByLabel('Confirm New Password')).toBeVisible()
    
    // Should show password change heading and helper text
    await expect(page.locator('text=Change Password')).toBeVisible()
    await expect(page.locator('text=Leave blank to keep current password')).toBeVisible()
  })

  test('should protect route when not authenticated', async ({ page }) => {
    // Clear authentication
    await page.addInitScript(() => {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
      ;(window as any).mockUser = null
    })
    
    await page.goto('/profile')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should clear password fields after successful save', async ({ page }) => {
    await page.goto('/profile')
    
    // Enter edit mode and fill password fields
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    await page.getByLabel('Current Password').fill('currentpass')
    await page.getByLabel('New Password').fill('newpass123')
    await page.getByLabel('Confirm New Password').fill('newpass123')
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click()
    
    // Wait for success and re-enter edit mode
    await expect(page.locator('text=Profile updated successfully!')).toBeVisible()
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Password fields should be empty
    await expect(page.getByLabel('Current Password')).toHaveValue('')
    await expect(page.getByLabel('New Password')).toHaveValue('')
    await expect(page.getByLabel('Confirm New Password')).toHaveValue('')
  })

  test('should handle saving without password change', async ({ page }) => {
    await page.goto('/profile')
    
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    
    // Change only username, leave password fields empty
    await page.getByLabel('Username').fill('updatedusername')
    
    // Submit form
    await page.getByRole('button', { name: 'Save Changes' }).click()
    
    // Should show success message
    await expect(page.locator('text=Profile updated successfully!')).toBeVisible()
  })
})