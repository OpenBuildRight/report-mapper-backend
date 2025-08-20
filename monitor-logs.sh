#!/bin/bash

echo "=== Report Mapper Log Monitor ==="
echo "Press Ctrl+C to stop monitoring"
echo ""

# Function to show logs
show_logs() {
    echo "=== Backend Log (last 10 lines) ==="
    tail -10 backend.log
    echo ""
    echo "=== Frontend Log (last 10 lines) ==="
    tail -10 frontend/frontend.log
    echo ""
    echo "=== Service Status ==="
    echo "Backend: $(curl -s http://localhost:8080/actuator/health > /dev/null && echo "✅ Running" || echo "❌ Not responding")"
    echo "Frontend: $(curl -s http://localhost:3000 > /dev/null && echo "✅ Running" || echo "❌ Not responding")"
    echo "Keycloak: $(curl -s http://localhost:9003/realms/my-realm/.well-known/openid-configuration > /dev/null && echo "✅ Running" || echo "❌ Not responding")"
    echo ""
    echo "=== URLs ==="
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8080"
    echo "Swagger UI: http://localhost:8080/swagger-ui/index.html"
    echo "Keycloak Admin: http://localhost:9003"
    echo ""
    echo "=== Test Credentials ==="
    echo "Username: alice"
    echo "Password: alice_password"
    echo ""
    echo "=================================="
}

# Show initial status
show_logs

# Monitor logs every 5 seconds
while true; do
    sleep 5
    clear
    show_logs
done
