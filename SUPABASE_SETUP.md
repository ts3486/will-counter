# Supabase Setup Guide for Will Counter

## Prerequisites
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Your project ready to connect to Supabase

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: `will-counter` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be set up (this may take a few minutes)

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` file
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- `users` table with Auth0 integration
- `will_counts` table for tracking daily counts
- Row Level Security (RLS) policies
- Indexes for performance
- Helper functions for common operations

## Step 3: Get Your Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Configure Environment Variables

### For Frontend (Expo)
Create a `.env` file in the `frontend` directory:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For API (Kotlin)
Create a `.env` file in the root directory:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Test the Connection

### Test API Connection
1. Start your API server:
   ```bash
   cd api
   ./gradlew run
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:8080/health
   ```

### Test Frontend Connection
1. Start your Expo app:
   ```bash
   cd frontend
   npx expo start
   ```

2. Check the console for any Supabase connection warnings

## Step 6: Verify Database Setup

1. In your Supabase dashboard, go to **Table Editor**
2. You should see:
   - `users` table
   - `will_counts` table
3. Go to **SQL Editor** and run:
   ```sql
   SELECT * FROM users LIMIT 1;
   SELECT * FROM will_counts LIMIT 1;
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Make sure your Supabase project is active
2. **SSL Errors**: The API is configured to use SSL for Supabase connections
3. **Authentication Errors**: Verify your anon key is correct
4. **Schema Errors**: Make sure you ran the complete schema in Step 2

### Environment Variables Not Loading

For Expo, make sure to:
1. Use `EXPO_PUBLIC_` prefix for environment variables
2. Restart the Expo development server after adding environment variables
3. Check that the `.env` file is in the correct location

## Next Steps

After setting up Supabase:
1. Set up Auth0 for authentication
2. Configure Row Level Security policies
3. Test the complete authentication flow
4. Deploy your application

## Security Notes

- Never commit your `.env` files to version control
- Use Row Level Security (RLS) policies to protect user data
- Regularly rotate your Supabase keys
- Monitor your Supabase usage and costs 