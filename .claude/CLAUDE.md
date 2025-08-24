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

## Mandatory Cleanup Workflow

**CRITICAL: Always perform these cleanup steps at the end of every session**

### Debug Code Cleanup Checklist
```bash
# 1. Remove all debug logging and print statements
# Search for debug patterns in the codebase:
grep -r "println\|console\.log\|print(" api/ frontend/ --include="*.kt" --include="*.ts" --include="*.js"

# 2. Remove temporary test endpoints and routes
# Look for test endpoints like /test-fix, /debug, /temp
grep -r "/test-\|/debug\|/temp" api/src/ --include="*.kt"

# 3. Clean up temporary files
find . -name "*.tmp" -o -name "*.temp" -o -name "debug-*" -delete

# 4. Kill any background processes and free ports
pkill -f "gradlew run" || true
pkill -f "npm start" || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

### Pre-Commit Verification
```bash
# Verify no debug code remains before any commits
# These commands should return zero results:
grep -r "TODO.*debug\|FIXME.*temp\|println\|console\.log" . --exclude-dir=node_modules --exclude-dir=.git

# Test that the app starts without debug endpoints
cd api && ./gradlew build
cd frontend && npm run build
```

### Session End Protocol
1. **Always search for and remove**:
   - `println()` statements in Kotlin files
   - `console.log()` statements in TypeScript/JavaScript
   - Temporary endpoints (e.g., `/test-fix`, `/debug`)
   - Debug headers or request logging
   - Test user data or hardcoded values

2. **Always kill processes**:
   - Backend servers on port 8080
   - Frontend servers on port 3000
   - Any other development servers

3. **Always verify**:
   - No debug code in committed files
   - All temporary endpoints removed
   - Proper error handling without verbose logging

This reference helps you quickly find commands and remember recent fixes.