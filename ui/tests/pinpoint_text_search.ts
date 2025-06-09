import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost/map');
  await page.getByRole('menuitem').nth(1).click();
  await page.locator('.bg-primary').first().click();
  await page.getByRole('button', { name: 'Pinpoint' }).click();
  await page.locator('.leaflet-container').click();
  await page.locator('.leaflet-container').click();
  await page.getByRole('button', { name: 'Close popup' }).click();
  await page.locator('.leaflet-container').click();
  await page.getByRole('button', { name: 'Pinpoint' }).click();
  await page.getByRole('button', { name: 'Pinpoint' }).click();
  await page.getByText('Search CenterDrag to change search locationRadius: 13 km×+− Leaflet | ©').click();
  await page.getByRole('textbox', { name: 'Search stations...' }).click();
  await page.getByRole('textbox', { name: 'Search stations...' }).fill('lidl');
  await page.getByText('45 - VGS-00004 - Lidl', { exact: true }).click();
  await page.getByRole('button', { name: 'Schedule' }).click();
});