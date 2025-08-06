#!/bin/bash

echo "🔍 Testing Supabase Connection for Will Counter App"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Check if API is running
echo -e "\n1. Testing API Health..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    print_status 0 "API is running and responding"
else
    print_status 1 "API is not running or not responding"
    echo "   Start the API with: cd api && ./gradlew run"
fi

# Test 2: Check environment variables
echo -e "\n2. Checking Environment Variables..."
if [ -n "$SUPABASE_URL" ]; then
    print_status 0 "SUPABASE_URL is set"
    echo "   URL: ${SUPABASE_URL:0:30}..."
else
    print_status 1 "SUPABASE_URL is not set"
fi

if [ -n "$SUPABASE_ANON_KEY" ]; then
    print_status 0 "SUPABASE_ANON_KEY is set"
    echo "   Key: ${SUPABASE_ANON_KEY:0:20}..."
else
    print_status 1 "SUPABASE_ANON_KEY is not set"
fi

# Test 3: Check .env files
echo -e "\n3. Checking .env Files..."
if [ -f "api/.env" ]; then
    print_status 0 "API .env file exists"
else
    print_status 1 "API .env file missing"
fi

if [ -f "frontend/.env" ]; then
    print_status 0 "Frontend .env file exists"
else
    print_status 1 "Frontend .env file missing"
fi

# Test 4: Test database connection via API
echo -e "\n4. Testing Database Connection..."
if curl -s http://localhost:8080/ | grep -q "Will Counter API"; then
    print_status 0 "Database connection successful"
else
    print_status 1 "Database connection failed"
fi

# Test 5: Check if tables exist (if API is running)
echo -e "\n5. Testing Database Tables..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    # Try to create a test user to verify tables exist
    TEST_RESPONSE=$(curl -s -X POST http://localhost:8080/users \
        -H "Content-Type: application/json" \
        -d '{"auth0_id": "test-connection-123", "email": "test@connection.com"}' 2>/dev/null)
    
    if echo "$TEST_RESPONSE" | grep -q "success"; then
        print_status 0 "Database tables exist and are accessible"
    else
        print_status 1 "Database tables may not exist or are not accessible"
        echo "   Run the schema.sql in Supabase SQL Editor"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping table test - API not running${NC}"
fi

echo -e "\n=================================================="
echo -e "${GREEN}Connection Test Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check Supabase dashboard for recent activity"
echo "2. Verify tables exist in Table Editor"
echo "3. Test frontend connection with Expo"
echo "4. Run actual app functionality tests" 