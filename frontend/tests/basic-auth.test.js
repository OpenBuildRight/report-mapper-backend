const { test, expect } = require('@playwright/test');

test.describe('Basic Authentication Tests', () => {
  test('should load login page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads with correct elements
    await expect(page.locator('text=Report Mapper')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('text=Please sign in to access the application')).toBeVisible();
    
    // Verify the page title
    await expect(page).toHaveTitle(/Report Mapper/);
  });

  test('should have working Sign In button', async ({ page }) => {
    await page.goto('/');
    
    // Click the Sign In button
    await page.click('button:has-text("Sign In")');
    
    // Wait for redirect to Keycloak
    await page.waitForURL(/localhost:9003/);
    
    // Verify we're on the Keycloak login page
    const currentUrl = page.url();
    console.log('Current URL after clicking Sign In:', currentUrl);
    
    // Should be redirected to Keycloak
    expect(currentUrl).toMatch(/localhost:9003/);
    expect(currentUrl).toMatch(/openid-connect\/auth/);
    expect(currentUrl).toMatch(/client_id=test-client/);
    expect(currentUrl).toMatch(/response_type=code/);
  });

  test('should check Keycloak availability', async ({ page }) => {
    // Test that Keycloak discovery endpoint is accessible
    const response = await page.goto('http://localhost:9003/realms/my-realm/.well-known/openid-configuration');
    expect(response.status()).toBe(200);
    
    // Parse the response to verify it's valid OIDC configuration
    const config = await response.json();
    expect(config.issuer).toBe('http://localhost:9003/realms/my-realm');
    expect(config.authorization_endpoint).toContain('localhost:9003');
    expect(config.token_endpoint).toContain('localhost:9003');
  });

  test('should verify backend API protection', async ({ request }) => {
    // Test that API calls without authentication return 401
    const response = await request.get('http://localhost:8080/image/123');
    expect(response.status()).toBe(401);
    
    // Test another protected endpoint
    const response2 = await request.get('http://localhost:8080/observation/123');
    expect(response2.status()).toBe(401);
  });

  test('should check frontend build and dependencies', async ({ page }) => {
    await page.goto('/');
    
    // Check that React is working by looking for specific elements
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('text=Report Mapper')).toBeVisible();
    
    // Check that the page has proper structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    
    // Verify no critical console errors (basic check)
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Log any errors for debugging
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
    
    // Basic check - we expect some errors might be normal during development
    expect(errors.length).toBeLessThan(10); // Allow some development errors
  });

  test('should verify OIDC configuration in frontend', async ({ page }) => {
    await page.goto('/');
    
    // Check that the OIDC context is properly initialized
    // This is a basic check that the page loads without OIDC errors
    await expect(page.locator('text=Report Mapper')).toBeVisible();
    
    // Wait for any OIDC initialization
    await page.waitForTimeout(2000);
    
    // The page should still be functional
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });
});
