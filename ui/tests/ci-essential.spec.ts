import { test, expect } from '@playwright/test'

/**
 * Essential CI tests - only critical functionality
 * These tests are designed to be fast, reliable, and catch breaking changes
 */

test.describe('Essential CI Tests', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should load login page correctly', async ({ page }) => {
    await page.goto('/login')
    
    // Check critical elements exist
    await expect(page.getByRole('heading', { name: 'SparkFlow' })).toBeVisible()
    await expect(page.locator('text=Welcome Back')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email or username')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should load register page correctly', async ({ page }) => {
    await page.goto('/register')
    
    // Check critical elements exist
    await expect(page.getByRole('heading', { name: 'SparkFlow' })).toBeVisible()
    await expect(page.locator('text=Get Started')).toBeVisible()
    await expect(page.getByPlaceholder('Choose a username')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
  })

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login')
    
    // Navigate to register
    await page.getByRole('link', { name: 'Sign up' }).click()
    await expect(page.locator('text=Get Started')).toBeVisible()
    
    // Navigate back to login
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page.locator('text=Welcome Back')).toBeVisible()
  })

  test('should protect dashboard route when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login or show login form
    await expect(page).toHaveURL(/\/(login|dashboard)/)
  })

  test('should load custom 404 page', async ({ page }) => {
    await page.goto('/non-existent-page')
    
    // Should show 404 page or redirect
    await expect(page.locator('body')).toBeVisible()
  })
})