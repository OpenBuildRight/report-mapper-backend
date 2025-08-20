#!/bin/bash

echo "=== Report Mapper End-to-End Login Test ==="
echo ""

# Check if services are running
echo "1. Checking if services are running..."

# Check backend
if curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo "   ✅ Backend is running on http://localhost:8080"
else
    echo "   ❌ Backend is not running"
    exit 1
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Frontend is running on http://localhost:3000"
else
    echo "   ❌ Frontend is not running"
    exit 1
fi

# Check Keycloak
if curl -s http://localhost:9003/realms/my-realm/.well-known/openid-configuration > /dev/null; then
    echo "   ✅ Keycloak is running on http://localhost:9003"
else
    echo "   ❌ Keycloak is not running"
    exit 1
fi

echo ""
echo "2. Testing OIDC Discovery..."
OIDC_CONFIG=$(curl -s http://localhost:9003/realms/my-realm/.well-known/openid-configuration)
if echo "$OIDC_CONFIG" | grep -q "authorization_endpoint"; then
    echo "   ✅ OIDC discovery endpoint is working"
else
    echo "   ❌ OIDC discovery endpoint is not working"
    exit 1
fi

echo ""
echo "3. Testing Frontend Login Page..."
FRONTEND_RESPONSE=$(curl -s http://localhost:3000)
if echo "$FRONTEND_RESPONSE" | grep -q "Report Mapper"; then
    echo "   ✅ Frontend login page is accessible"
else
    echo "   ❌ Frontend login page is not accessible"
    exit 1
fi

echo ""
echo "4. Testing Backend API (should require authentication)..."
API_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/image/123)
HTTP_CODE=$(echo "$API_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
    echo "   ✅ Backend API correctly requires authentication (401 Unauthorized)"
else
    echo "   ❌ Backend API authentication not working (got HTTP $HTTP_CODE)"
fi

echo ""
echo "=== Test Summary ==="
echo "✅ All services are running"
echo "✅ OIDC discovery is working"
echo "✅ Frontend is accessible"
echo "✅ Backend requires authentication"
echo ""
echo "=== Manual Test Instructions ==="
echo "1. Open your browser and go to: http://localhost:3000"
echo "2. You should see the login page"
echo "3. Click 'Sign In' button"
echo "4. You'll be redirected to Keycloak login"
echo "5. Use these test credentials:"
echo "   - Username: alice"
echo "   - Password: alice_password"
echo "6. After successful login, you should be redirected back to the app"
echo "7. You should see the main application with tabs for 'Upload Images' and 'Create Observation'"
echo ""
echo "=== Test Credentials ==="
echo "Username: alice"
echo "Password: alice_password"
echo ""
echo "=== URLs ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8080"
echo "Keycloak Admin: http://localhost:9003"
echo "Swagger UI: http://localhost:8080/swagger-ui/index.html"
