const { test, expect } = require('@playwright/test');

// Simple test that checks if the login page loads
test('should load login page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Check that the page loads
  await expect(page.locator('text=Report Mapper')).toBeVisible();
  await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
});

// Test that checks if Keycloak is accessible
test('should be able to access Keycloak', async ({ page }) => {
  const response = await page.goto('http://localhost:9003/realms/my-realm/.well-known/openid-configuration');
  expect(response.status()).toBe(200);
});

// Test that checks if backend API requires authentication
test('should require authentication for API calls', async ({ request }) => {
  const response = await request.get('http://localhost:8080/image/123');
  expect(response.status()).toBe(401);
});
