const { test, expect } = require('@playwright/test');

test.describe('OIDC Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should show login page when not authenticated', async ({ page }) => {
    // Check that we're on the login page
    await expect(page.locator('text=Report Mapper')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Verify the page title
    await expect(page).toHaveTitle(/Report Mapper/);
  });

  test('should redirect to Keycloak login when Sign In is clicked', async ({ page }) => {
    // Click the Sign In button
    await page.click('text=Sign In');
    
    // Wait for redirect to Keycloak
    await page.waitForURL(/localhost:9003/);
    
    // Verify we're on the Keycloak login page
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[type="submit"]')).toBeVisible();
  });

  test('should successfully authenticate with valid credentials', async ({ page }) => {
    // Click Sign In to go to Keycloak
    await page.click('text=Sign In');
    await page.waitForURL(/localhost:9003/);
    
    // Fill in the login credentials
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice_password');
    
    // Submit the form
    await page.click('input[type="submit"]');
    
    // Wait for redirect back to the application
    await page.waitForURL(/localhost:3000/);
    
    // Verify we're now authenticated and on the main app
    await expect(page.locator('text=Report Mapper')).toBeVisible();
    await expect(page.locator('text=Upload Images')).toBeVisible();
    await expect(page.locator('text=Create Observation')).toBeVisible();
    
    // Check that user info is displayed
    await expect(page.locator('text=alice')).toBeVisible();
    
    // Verify Sign Out button is present
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Click Sign In to go to Keycloak
    await page.click('text=Sign In');
    await page.waitForURL(/localhost:9003/);
    
    // Fill in invalid credentials
    await page.fill('input[name="username"]', 'invalid_user');
    await page.fill('input[name="password"]', 'wrong_password');
    
    // Submit the form
    await page.click('input[type="submit"]');
    
    // Wait for error message (Keycloak shows error on same page)
    await expect(page.locator('text=Invalid username or password')).toBeVisible();
    
    // Verify we're still on the Keycloak login page
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('should allow logout and return to login page', async ({ page }) => {
    // First authenticate
    await page.click('text=Sign In');
    await page.waitForURL(/localhost:9003/);
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice_password');
    await page.click('input[type="submit"]');
    await page.waitForURL(/localhost:3000/);
    
    // Verify we're authenticated
    await expect(page.locator('text=Upload Images')).toBeVisible();
    
    // Click Sign Out
    await page.click('text=Sign Out');
    
    // Wait for redirect back to login page
    await page.waitForURL(/localhost:3000/);
    
    // Verify we're back on the login page
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Upload Images')).not.toBeVisible();
  });

  test('should maintain authentication state on page refresh', async ({ page }) => {
    // First authenticate
    await page.click('text=Sign In');
    await page.waitForURL(/localhost:9003/);
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice_password');
    await page.click('input[type="submit"]');
    await page.waitForURL(/localhost:3000/);
    
    // Verify we're authenticated
    await expect(page.locator('text=Upload Images')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    
    // Verify we're still authenticated
    await expect(page.locator('text=Upload Images')).toBeVisible();
    await expect(page.locator('text=alice')).toBeVisible();
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('should navigate between tabs when authenticated', async ({ page }) => {
    // First authenticate
    await page.click('text=Sign In');
    await page.waitForURL(/localhost:9003/);
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice_password');
    await page.click('input[type="submit"]');
    await page.waitForURL(/localhost:3000/);
    
    // Test Upload Images tab
    await page.click('text=Upload Images');
    await expect(page.locator('text=Upload Images')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Test Create Observation tab
    await page.click('text=Create Observation');
    await expect(page.locator('text=Create Observation')).toBeVisible();
    await expect(page.locator('input[name="title"]')).toBeVisible();
  });
});

test.describe('API Authentication', () => {
  test('should require authentication for API calls', async ({ request }) => {
    // Test that API calls without authentication return 401
    const response = await request.get('http://localhost:8080/image/123');
    expect(response.status()).toBe(401);
  });

  test('should allow API calls with valid token', async ({ page, request }) => {
    // First authenticate to get a token
    await page.goto('/');
    await page.click('text=Sign In');
    await page.waitForURL(/localhost:9003/);
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice_password');
    await page.click('input[type="submit"]');
    await page.waitForURL(/localhost:3000/);
    
    // Get the access token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
    
    // Test API call with token
    const response = await request.get('http://localhost:8080/image/123', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Should not be 401 (might be 404 for non-existent image, but not 401)
    expect(response.status()).not.toBe(401);
  });
});
