import { test, expect } from '@playwright/test';

test('admin page loads correctly', async ({ page }) => {
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001/';
  await page.goto(adminUrl);

  // Expect the body to be visible
  await expect(page.locator('body')).toBeVisible();
});
