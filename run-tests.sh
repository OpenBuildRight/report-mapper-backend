#!/bin/bash

echo "=== Report Mapper Test Suite ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if a service is running
check_service() {
    local service=$1
    local url=$2
    local name=$3
    
    if curl -s "$url" > /dev/null 2>&1; then
        print_status "SUCCESS" "$name is running on $url"
        return 0
    else
        print_status "ERROR" "$name is not running on $url"
        return 1
    fi
}

# Function to run tests
run_test_suite() {
    local test_name=$1
    local test_command=$2
    
    echo -e "\n${BLUE}Running $test_name...${NC}"
    if eval "$test_command"; then
        print_status "SUCCESS" "$test_name completed successfully"
        return 0
    else
        print_status "ERROR" "$test_name failed"
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    print_status "ERROR" "Please run this script from the project root directory"
    exit 1
fi

echo "1. Checking service availability..."
echo ""

# Check all services
services_ok=true
check_service "backend" "http://localhost:8080/actuator/health" "Backend API" || services_ok=false
check_service "frontend" "http://localhost:3000" "Frontend" || services_ok=false
check_service "keycloak" "http://localhost:9003/realms/my-realm/.well-known/openid-configuration" "Keycloak" || services_ok=false

if [ "$services_ok" = false ]; then
    echo ""
    print_status "ERROR" "Some services are not running. Please start all services first:"
    echo "  - Backend: mvn spring-boot:run -Dspring-boot.run.profiles=local"
    echo "  - Frontend: cd frontend && npm start"
    echo "  - Infrastructure: cd local-env-setup && docker-compose up -d"
    exit 1
fi

echo ""
print_status "SUCCESS" "All services are running!"

echo ""
echo "2. Running unit tests..."
cd frontend

# Run unit tests
run_test_suite "Unit Tests" "npm run test:unit -- --passWithNoTests --silent" || unit_tests_failed=true

echo ""
echo "3. Running end-to-end tests..."
echo ""

# Check if Playwright browsers are installed
if [ ! -d "node_modules/.cache/ms-playwright" ]; then
    print_status "INFO" "Installing Playwright browsers..."
    npx playwright install
fi

# Run end-to-end tests
run_test_suite "End-to-End Tests" "npm run test:e2e -- --reporter=line" || e2e_tests_failed=true

cd ..

echo ""
echo "=== Test Summary ==="

if [ "$unit_tests_failed" = true ]; then
    print_status "ERROR" "Unit tests failed"
else
    print_status "SUCCESS" "Unit tests passed"
fi

if [ "$e2e_tests_failed" = true ]; then
    print_status "ERROR" "End-to-end tests failed"
else
    print_status "SUCCESS" "End-to-end tests passed"
fi

echo ""
echo "=== Test Reports ==="
echo "Unit test coverage: frontend/coverage/lcov-report/index.html"
echo "E2E test report: frontend/playwright-report/index.html"
echo ""

if [ "$unit_tests_failed" = true ] || [ "$e2e_tests_failed" = true ]; then
    print_status "ERROR" "Some tests failed. Check the reports above for details."
    exit 1
else
    print_status "SUCCESS" "All tests passed! 🎉"
    echo ""
    echo "=== Manual Test Instructions ==="
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Click 'Sign In' and use credentials: alice / alice_password"
    echo "3. Verify you can access the main application"
    echo "4. Test the Upload Images and Create Observation features"
fi
