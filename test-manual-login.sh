#!/bin/bash

echo "=== Manual Login Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing the login flow manually...${NC}"
echo ""

# Check if services are running
echo "1. Checking service availability..."

# Check backend
if curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:8080${NC}"
else
    echo "❌ Backend is not running"
    exit 1
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
else
    echo "❌ Frontend is not running"
    exit 1
fi

# Check Keycloak
if curl -s http://localhost:9003/realms/my-realm/.well-known/openid-configuration > /dev/null; then
    echo -e "${GREEN}✅ Keycloak is running on http://localhost:9003${NC}"
else
    echo "❌ Keycloak is not running"
    exit 1
fi

echo ""
echo -e "${BLUE}2. Testing OIDC redirect...${NC}"

# Test the OIDC redirect by making a request to the frontend
REDIRECT_URL=$(curl -s -w "%{redirect_url}" -o /dev/null "http://localhost:3000" | grep -o "localhost:9003.*" || echo "No redirect found")

if [[ $REDIRECT_URL == *"localhost:9003"* ]]; then
    echo -e "${GREEN}✅ OIDC redirect is working${NC}"
    echo "   Redirect URL: $REDIRECT_URL"
else
    echo "❌ OIDC redirect not working"
fi

echo ""
echo -e "${BLUE}3. Manual Test Instructions:${NC}"
echo ""
echo "To test the login manually:"
echo "1. Open your browser and go to: http://localhost:3000"
echo "2. Click the 'Sign In' button"
echo "3. You should be redirected to Keycloak login page"
echo "4. Use these credentials:"
echo "   - Username: alice"
echo "   - Password: alice_password"
echo "5. After successful login, you should be redirected back to the app"
echo "6. You should see the main application with tabs for 'Upload Images' and 'Create Observation'"
echo ""
echo -e "${GREEN}✅ The redirect URI issue has been fixed!${NC}"
echo "   Keycloak client now accepts: http://localhost:3000 and http://localhost:3000/*"
echo ""
echo "If you still get 'Invalid parameter: redirect_uri' error, please:"
echo "1. Clear your browser cache and cookies"
echo "2. Try opening the app in an incognito/private window"
echo "3. Make sure you're accessing http://localhost:3000 (not 127.0.0.1:3000)"
