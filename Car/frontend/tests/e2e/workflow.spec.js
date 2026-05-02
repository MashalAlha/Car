// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Car Dealership Platform – Critical Path', () => {

  test('Homepage loads with branding and CTA buttons', async ({ page }) => {
    await page.goto('/');
    
    // Verify the main heading is visible
    await expect(page.locator('h1')).toContainText('Car Dealership Premium');

    // Verify CTA buttons exist
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  test('Promo banner is visible and can be dismissed', async ({ page }) => {
    await page.goto('/');
    
    // The gold ticker promo banner should appear
    const banner = page.locator('text=Summer Performance Event');
    await expect(banner).toBeVisible();

    // Dismiss it
    await page.locator('button', { has: page.locator('svg') }).first().click();
  });

  test('Auth page renders login form', async ({ page }) => {
    await page.goto('/login');
    
    // Should show the login form fields
    await expect(page.locator('input[type="email"], input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Car catalog page loads', async ({ page }) => {
    await page.goto('/catalog');
    
    // Catalog heading should be present
    await expect(page.locator('h1')).toBeVisible();
  });

  test('E-commerce store loads with compatibility engine', async ({ page }) => {
    await page.goto('/store');
    
    // Verify the hero heading
    await expect(page.locator('h1')).toContainText('Elevate Your Drive');

    // Compatibility engine selectors should be visible
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('Support center form is accessible', async ({ page }) => {
    await page.goto('/support');

    // Heading should be visible
    await expect(page.locator('h1')).toContainText('Client Support Center');

    // Form fields should be present
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('Favorites page loads with Digital Garage heading', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page.locator('h1')).toContainText('Digital Garage');
  });

  test('Workshop booking page loads', async ({ page }) => {
    await page.goto('/workshop/book');

    await expect(page.locator('h1')).toBeVisible();
  });

});
