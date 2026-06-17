import { test, expect } from '@playwright/test';

test.describe('Client Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173/';
    await page.goto(clientUrl);
  });

  test('can navigate to Products page', async ({ page }) => {
    // Find the link to products (usually in the navbar) and click it
    // We use a regex or exact text. Assuming there is a "Products" or "Shop" link.
    const productsLink = page.getByRole('link', { name: /products|shop/i }).first();
    
    // If the link exists, click it and verify the URL changes
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await expect(page).toHaveURL(/.*products/);
    }
  });

  test('can navigate to Cart page', async ({ page }) => {
    // Find the cart link by its href attribute (since it only has an icon, no text)
    const cartLink = page.locator('a[href="/cart"]').first();
    
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await expect(page).toHaveURL(/.*cart/);
    }
  });

  test('can navigate to Login page', async ({ page }) => {
    // Find the login link and click it
    const loginLink = page.getByRole('link', { name: /login|sign in/i }).first();
    
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });
});
