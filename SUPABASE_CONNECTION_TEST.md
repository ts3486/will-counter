# Supabase Connection Testing Guide

## Prerequisites
- Supabase project created and active
- Environment variables configured
- API and frontend code updated for Supabase

## Step 1: Test API Connection

### 1.1 Start the API Server
```bash
cd api
./gradlew run
```

### 1.2 Check API Health Endpoint
```bash
curl http://localhost:8080/health
```
**Expected Response**: `API is running and healthy`

### 1.3 Test Database Connection
```bash
curl http://localhost:8080/
```
**Expected Response**: JSON with API info and database status

### 1.4 Check API Logs
Look for these messages in the API console:
- ✅ `"Database initialized successfully"`
- ✅ `"Database connection test passed"`
- ❌ `"Database connection test failed"` (if connection failed)

## Step 2: Test Frontend Connection

### 2.1 Start Frontend
```bash
cd frontend
npx expo start
```

### 2.2 Check Console for Warnings
Look for:
- ✅ No Supabase configuration warnings
- ❌ `"⚠️ Supabase configuration not set"` (if env vars missing)

### 2.3 Test Supabase Client
Add this test code to your frontend temporarily:

```typescript
// Add to any screen component temporarily
import { supabase } from '../config/supabase';

// Test connection
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
    } else {
      console.log('✅ Supabase connection successful:', data);
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
  }
};

// Call this in useEffect or on button press
testSupabaseConnection();
```

## Step 3: Verify Environment Variables

### 3.1 Check API Environment Variables
```bash
# In api directory
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

### 3.2 Check Frontend Environment Variables
```bash
# In frontend directory
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### 3.3 Verify .env Files Exist
```bash
# Check if .env files exist
ls -la api/.env
ls -la frontend/.env
```

## Step 4: Test Database Operations

### 4.1 Test User Creation (API)
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "auth0_id": "test-user-123",
    "email": "test@example.com"
  }'
```

### 4.2 Test Will Count Operations (API)
```bash
# Create a will count
curl -X POST http://localhost:8080/will-counts \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-uuid",
    "date": "2024-01-15"
  }'
```

## Step 5: Verify in Supabase Dashboard

### 5.1 Check Database Tables
1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Verify tables exist:
   - ✅ `users` table
   - ✅ `will_counts` table

### 5.2 Check Recent Activity
1. Go to **Logs** in Supabase dashboard
2. Look for recent database queries
3. Check for any connection errors

### 5.3 Test SQL Queries
In Supabase **SQL Editor**, run:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'will_counts');

-- Check recent data
SELECT * FROM users LIMIT 5;
SELECT * FROM will_counts LIMIT 5;
```

## Step 6: Connection Status Indicators

### ✅ Success Indicators
- API starts without database errors
- Health endpoint returns success
- Frontend console shows no Supabase warnings
- Database operations work (create/read/update/delete)
- Supabase dashboard shows recent activity
- Tables exist and are accessible

### ❌ Failure Indicators
- API fails to start with database errors
- Connection timeout errors
- Authentication failures
- Missing environment variables
- SSL connection errors
- Invalid credentials

## Step 7: Troubleshooting Common Issues

### Issue: "Database connection test failed"
**Solution**: Check environment variables and Supabase credentials

### Issue: "SSL connection error"
**Solution**: Verify SSL configuration in DatabaseConfig.kt

### Issue: "Authentication failed"
**Solution**: Verify anon key is correct and not expired

### Issue: "Table does not exist"
**Solution**: Run the schema.sql in Supabase SQL Editor

### Issue: "Environment variables not found"
**Solution**: Create .env files with correct variable names

## Step 8: Quick Connection Test Script

Create a test script to verify everything:

```bash
#!/bin/bash
# save as test-supabase-connection.sh

echo "🔍 Testing Supabase Connection..."

# Test API health
echo "1. Testing API health..."
curl -s http://localhost:8080/health

# Test environment variables
echo -e "\n2. Checking environment variables..."
echo "SUPABASE_URL: ${SUPABASE_URL:0:20}..."
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."

# Test database connection
echo -e "\n3. Testing database connection..."
curl -s http://localhost:8080/ | jq '.data.message'

echo -e "\n✅ Connection test complete!"
```

## Step 9: Production Verification

For production deployment:
1. Test with production Supabase project
2. Verify RLS policies work correctly
3. Test with real Auth0 tokens
4. Monitor connection performance
5. Set up alerts for connection failures

## Summary

A successful Supabase connection means:
- ✅ API connects to Supabase PostgreSQL
- ✅ Frontend can communicate with Supabase
- ✅ Database operations work correctly
- ✅ Environment variables are properly configured
- ✅ No connection errors in logs
- ✅ Data persists across restarts 