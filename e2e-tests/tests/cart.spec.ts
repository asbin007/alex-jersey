import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Flow', () => {
  test('can add a jersey to the cart', async ({ page }) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173/';
    await page.goto(`${clientUrl}products`);

    // 2. Click on the first product link
    // The products are usually displayed as links wrapping the product card
    // We'll look for a link that has an href starting with /products/
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Wait for the product detail page to load by checking the URL
    await expect(page).toHaveURL(/.*\/products\/.+/);

    // 3. Select a size (e.g., "M" or any available size)
    // Find all size buttons that are NOT disabled
    const availableSizeButton = page.locator('button:not([disabled])', { hasText: /^[SMLXL]+$/ }).first();
    await availableSizeButton.click();

    // 4. Click the "Add to Cart" button
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await addToCartButton.click();

    // 5. Navigate to the Cart page to verify it was added
    const cartLink = page.locator('a[href="/cart"]').first();
    await cartLink.click();
    await expect(page).toHaveURL(/.*\/cart/);

    // 6. Verify that the cart has at least one item
    // We check for "Proceed to Checkout" button or item list, 
    // but the simplest is just checking if "Your Cart is Empty" is NOT there, 
    // or verifying a generic cart item element is visible.
    // Let's assert that "Checkout" or "Proceed to Checkout" is visible
    const checkoutButton = page.getByRole('link', { name: /checkout/i });
    await expect(checkoutButton).toBeVisible();
  });
});
