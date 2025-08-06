# Simple Supabase Connection Test

## Quick Test Steps

### Step 1: Start Your API
```bash
cd api
./gradlew run
```

**Look for**: `"Database initialized successfully"` in the console

### Step 2: Test API Health
```bash
curl http://localhost:8080/health
```

**Expected**: `API is running and healthy`

### Step 3: Test Database Connection
```bash
curl http://localhost:8080/
```

**Expected**: JSON response with API info

### Step 4: Check Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click **Table Editor**
3. You should see: `users` and `will_counts` tables

### Step 5: Test Frontend
```bash
cd frontend
npx expo start
```

**Look for**: No Supabase warnings in the console

## Success Indicators ✅

- API starts without errors
- Health endpoint works
- Tables exist in Supabase dashboard
- No connection warnings in frontend

## Failure Indicators ❌

- API fails to start
- "Database connection test failed" message
- Missing tables in Supabase
- Frontend shows Supabase warnings

## If It's Not Working

1. **Check environment variables**:
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   ```

2. **Verify .env files exist**:
   ```bash
   ls -la api/.env
   ls -la frontend/.env
   ```

3. **Run schema in Supabase**:
   - Go to Supabase SQL Editor
   - Copy and run `supabase-schema.sql`

That's it! This should tell you if your app is connected to Supabase. 