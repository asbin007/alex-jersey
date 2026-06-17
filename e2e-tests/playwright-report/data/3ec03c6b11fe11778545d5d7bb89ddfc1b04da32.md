# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart.spec.ts >> Shopping Cart Flow >> can add a jersey to the cart
- Location: tests\cart.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href^="/products/"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a[href^="/products/"]').first()

```

```yaml
- main:
  - paragraph:
    - strong: "404"
    - text: ": NOT_FOUND Code:"
    - code: "`NOT_FOUND`"
    - text: "ID:"
    - code: "`bom1::rplsq-1781686174941-1c9388dc47e4`"
  - link "Read our documentation to learn more about this error.":
    - /url: https://vercel.com/docs/errors/NOT_FOUND
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Shopping Cart Flow', () => {
  4  |   test('can add a jersey to the cart', async ({ page }) => {
  5  |     const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173/';
  6  |     await page.goto(`${clientUrl}products`);
  7  | 
  8  |     // 2. Click on the first product link
  9  |     // The products are usually displayed as links wrapping the product card
  10 |     // We'll look for a link that has an href starting with /products/
  11 |     const firstProduct = page.locator('a[href^="/products/"]').first();
> 12 |     await expect(firstProduct).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  13 |     await firstProduct.click();
  14 | 
  15 |     // Wait for the product detail page to load by checking the URL
  16 |     await expect(page).toHaveURL(/.*\/products\/.+/);
  17 | 
  18 |     // 3. Select a size (e.g., "M" or any available size)
  19 |     // Find all size buttons that are NOT disabled
  20 |     const availableSizeButton = page.locator('button:not([disabled])', { hasText: /^[SMLXL]+$/ }).first();
  21 |     await availableSizeButton.click();
  22 | 
  23 |     // 4. Click the "Add to Cart" button
  24 |     const addToCartButton = page.getByRole('button', { name: /add to cart/i });
  25 |     await addToCartButton.click();
  26 | 
  27 |     // 5. Navigate to the Cart page to verify it was added
  28 |     const cartLink = page.locator('a[href="/cart"]').first();
  29 |     await cartLink.click();
  30 |     await expect(page).toHaveURL(/.*\/cart/);
  31 | 
  32 |     // 6. Verify that the cart has at least one item
  33 |     // We check for "Proceed to Checkout" button or item list, 
  34 |     // but the simplest is just checking if "Your Cart is Empty" is NOT there, 
  35 |     // or verifying a generic cart item element is visible.
  36 |     // Let's assert that "Checkout" or "Proceed to Checkout" is visible
  37 |     const checkoutButton = page.getByRole('link', { name: /checkout/i });
  38 |     await expect(checkoutButton).toBeVisible();
  39 |   });
  40 | });
  41 | 
```