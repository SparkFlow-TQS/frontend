import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost/map');
  await page.getByRole('link', { name: 'Map' }).click();
  await page.getByRole('menuitem').nth(1).click();
  await page.locator('.bg-primary').first().click();
  await page.locator('div:nth-child(2) > span > .bg-muted > .bg-primary').click();
  await page.locator('div:nth-child(3) > span > .bg-muted > .bg-primary').click();
  await page.getByRole('button', { name: 'Nearest' }).click();
  await page.getByRole('button', { name: 'Schedule' }).click();
});