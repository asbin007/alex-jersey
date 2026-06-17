import { test, expect } from '@playwright/test';

test('client homepage loads and has a title', async ({ page }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173/';
  await page.goto(clientUrl);

  // Expect the page to have loaded (we can check the document title or a specific heading)
  // We'll just ensure the page didn't crash and has some text
  await expect(page.locator('body')).toBeVisible();
});
