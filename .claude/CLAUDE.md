# Claude Code Quick Reference - Will Counter

## Common Commands

### Development Server Commands
```bash
# Start backend server
cd api && ./gradlew run

# Start frontend development server
cd frontend && npm start

# Run tests
cd frontend && npm test
```

### Authentication Testing
```bash
# Test API endpoint with curl (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/will-counts/today

# Check Auth0 configuration
echo "Domain: $AUTH0_DOMAIN"
echo "Audience: $AUTH0_AUDIENCE"
```

### Security Commands  
```bash
# Run security audit
cd frontend && npm audit

# Check for vulnerabilities
cd api && ./gradlew dependencyCheck
```

## Key File Locations

### Configuration Files
- Backend env: `api/.env`
- Frontend env: `frontend/.env` 
- Auth0 config: `frontend/src/config/auth0.ts`
- Supabase config: `frontend/src/config/supabase.ts`

### Critical Security Files
- JWT validation: `api/src/main/kotlin/com/willcounter/api/config/Auth0Config.kt`
- Environment loading: `api/build.gradle.kts`
- API routes: `api/src/main/kotlin/com/willcounter/api/routes/`

## Recent Fixes Applied

### Security Vulnerabilities Fixed
1. **Authentication bypass** in Auth0Config.kt - removed JWE processing
2. **Environment variable injection** in build.gradle.kts - added regex validation  
3. **Token format issue** in auth0.ts - changed `additionalParameters` to `extraParams`

### Working Patterns
- Only accept 3-part JWT tokens for security
- Validate env variable names with `^[A-Z_][A-Z0-9_]*$`
- Use `extraParams` for Auth0 audience parameter
- Always include Bearer token in API requests

## Environment Variables Required

### Backend (.env in api/)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH0_DOMAIN=
AUTH0_AUDIENCE=
DATABASE_URL=
```

### Frontend (.env in frontend/)
```
EXPO_PUBLIC_AUTH0_DOMAIN=
EXPO_PUBLIC_AUTH0_CLIENT_ID=
EXPO_PUBLIC_AUTH0_AUDIENCE=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Debugging Tips

### Authentication Issues
1. Check token format (should be 3 parts separated by dots)
2. Verify Auth0 audience parameter is in `extraParams`
3. Ensure JWT validation only accepts standard tokens
4. Test with curl using actual Bearer token

### Build Issues
1. Check environment variables are properly loaded
2. Verify regex validation allows your env var names
3. Ensure proper dependencies in build.gradle.kts

This reference helps you quickly find commands and remember recent fixes.