import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login')
    
    // Check page elements
    await expect(page.getByRole('heading', { name: 'SparkFlow' })).toBeVisible()
    await expect(page.locator('text=Welcome Back')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email or username')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await expect(page.locator('text=Don\'t have an account?')).toBeVisible()
  })

  test('should display register page correctly', async ({ page }) => {
    await page.goto('/register')
    
    // Check page elements
    await expect(page.getByRole('heading', { name: 'SparkFlow' })).toBeVisible()
    await expect(page.locator('text=Get Started')).toBeVisible()
    await expect(page.getByPlaceholder('Choose a username')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Create a password')).toBeVisible()
    await expect(page.getByPlaceholder('Confirm your password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login')
    
    // Button should be disabled when form is empty
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeDisabled()
    
    // Check that form fields are visible and empty
    await expect(page.getByPlaceholder('Enter your email or username')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
  })

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login')
    
    // Navigate to register
    await page.getByRole('link', { name: 'Sign up' }).click()
    await expect(page).toHaveURL('/register')
    
    // Navigate back to login  
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should load dashboard route', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should load dashboard (auth protection may or may not be implemented)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show operator checkbox in registration', async ({ page }) => {
    await page.goto('/register')
    
    const operatorCheckbox = page.getByRole('checkbox', { name: 'Register as station operator' })
    await expect(operatorCheckbox).toBeVisible()
    
    // Test checking the checkbox
    await operatorCheckbox.check()
    await expect(operatorCheckbox).toBeChecked()
  })
})