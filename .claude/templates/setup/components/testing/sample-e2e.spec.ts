/**
 * Sample E2E test - replace with your own tests.
 *
 * Location: tests/e2e/sample.spec.ts
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

test.describe('Sample E2E Suite', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Adjust this assertion for your app
    // For Next.js: expect page to have content
    // For Directus: expect redirect to /admin/login
    await expect(page).toHaveTitle(/.+/);
  });

  // Remove this file after adding real tests
});
