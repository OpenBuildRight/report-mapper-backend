const { test, expect } = require('@playwright/test');

test.describe('Full OIDC Login Flow', () => {
  test('should complete full authentication flow', async ({ page }) => {
    // Step 1: Navigate to the application
    await page.goto('/');
    
    // Step 2: Verify we're on the login page
    await expect(page.locator('text=Report Mapper')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    
    // Step 3: Click Sign In to start OIDC flow
    await page.click('button:has-text("Sign In")');
    
    // Step 4: Wait for redirect to Keycloak
    await page.waitForURL(/localhost:9003/);
    
    // Step 5: Verify we're on Keycloak login page
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[type="submit"]')).toBeVisible();
    
    // Step 6: Fill in credentials
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice_password');
    
    // Step 7: Submit the form
    await page.click('input[type="submit"]');
    
    // Step 8: Wait for redirect back to the application
    await page.waitForURL(/localhost:3000/);
    
    // Step 9: Verify we're now authenticated
    await expect(page.locator('text=Report Mapper')).toBeVisible();
    await expect(page.locator('text=Upload Images')).toBeVisible();
    await expect(page.locator('text=Create Observation')).toBeVisible();
    
    // Step 10: Check that user info is displayed
    await expect(page.locator('text=alice')).toBeVisible();
    
    // Step 11: Verify Sign Out button is present
    await expect(page.locator('text=Sign Out')).toBeVisible();
    
    console.log('✅ Full authentication flow completed successfully!');
  });

  test('should handle logout correctly', async ({ page }) => {
    // First authenticate
    await page.goto('/');
    await page.click('button:has-text("Sign In")');
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
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('text=Upload Images')).not.toBeVisible();
    
    console.log('✅ Logout flow completed successfully!');
  });

  test('should test API access with authentication', async ({ page, request }) => {
    // First authenticate to get a token
    await page.goto('/');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/localhost:9003/);
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice_password');
    await page.click('input[type="submit"]');
    await page.waitForURL(/localhost:3000/);
    
    // Get the access token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
    console.log('✅ Access token obtained:', token.substring(0, 20) + '...');
    
    // Test API call with token
    const response = await request.get('http://localhost:8080/image/123', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Should not be 401 (might be 404 for non-existent image, but not 401)
    expect(response.status()).not.toBe(401);
    console.log('✅ API call with token successful, status:', response.status());
  });

  test('should test navigation between tabs when authenticated', async ({ page }) => {
    // First authenticate
    await page.goto('/');
    await page.click('button:has-text("Sign In")');
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
    
    console.log('✅ Tab navigation working correctly!');
  });
});
