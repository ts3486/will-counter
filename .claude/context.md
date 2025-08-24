# Claude Code Context - Will Counter Project

## Current Development Context

### Active Development Areas
- **Authentication System**: ✅ **COMPLETED** - Fixed critical authentication bypass vulnerability, JWT token validation working
- **Security Hardening**: ✅ **COMPLETED** - Fixed environment variable injection vulnerability in build.gradle.kts  
- **Backend API**: ✅ **WORKING** - Kotlin/Ktor server with Auth0 JWT validation and Supabase integration
- **Frontend Auth Flow**: ✅ **WORKING** - React Native + Expo with Auth0 OAuth returning proper 3-part JWT tokens

### Recent Problem Solving
1. **Critical Security Fix**: Removed authentication bypass vulnerability from Auth0Config.kt (JWE processing)
2. **Token Format Issue**: Fixed Auth0 configuration to return JWT tokens instead of opaque tokens by changing `additionalParameters` to `extraParams` 
3. **Environment Variable Injection**: Added validation regex `^[A-Z_][A-Z0-9_]*$` to prevent command injection in Gradle build
4. **Authentication Flow**: Successfully debugged and resolved "Authentication required" errors in fetchTodayCount endpoint

### Technical Stack Understanding
- **Frontend**: React Native 0.79 + Expo 53 + TypeScript + Redux Toolkit
- **Backend**: Kotlin + Ktor 2.3 + Gradle 8.13 + Auth0 JWT validation with RS256
- **Database**: Supabase (PostgreSQL) with REST API access and service role authentication
- **Authentication**: Auth0 OAuth with 3-part JWT tokens (fixed from opaque token issue)
- **Security**: Input validation, JWT verification with JWK provider, environment variable sanitization
- **Testing**: Jest with React Test Renderer and comprehensive mocking

## Code Quality Standards

### Current Implementation Patterns
```typescript
// Auth0 Configuration Pattern (FIXED)
export const createAuthRequest = (): AuthRequestConfig => ({
  clientId: auth0Config.clientId,
  scopes: auth0Config.scope.split(' '),
  redirectUri: auth0Config.redirectUri,
  extraParams: {  // Changed from additionalParameters to extraParams
    audience: auth0Config.audience,
  },
});
```

```kotlin
// Secure JWT Validation Pattern (Auth0Config.kt)
fun verifyToken(token: String): DecodedJWT? {
    return try {
        val parts = token.split(".")
        // Only accept standard 3-part JWT tokens for security
        if (parts.size == 3) {
            return verifyJWTToken(token)
        } else {
            return null
        }
    } catch (e: Exception) {
        null
    }
}

// Environment Variable Validation Pattern (build.gradle.kts)
if (key.matches(Regex("^[A-Z_][A-Z0-9_]*$"))) {
    systemProperty(key, value)
}
```

```typescript
// API Service Pattern with Bearer Token
const response = await fetch(`${API_URL}/api/will-counts/today`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Testing Patterns
```typescript
// Component Test Pattern
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => {
      React.createElement(ComponentName);
    }).not.toThrow();
  });
});

// Mock Pattern for Expo Modules
jest.mock('expo-auth-session', () => ({
  useAuthRequest: () => [null, null, jest.fn()],
  exchangeCodeAsync: jest.fn(),
}));
```

## Environment & Configuration

### Development Setup Knowledge
- **Environment Files**: Root `.env` for backend, `frontend/.env` for frontend with `EXPO_PUBLIC_` prefix
- **Database Connection**: Frontend uses Supabase REST API directly with anon key
- **Authentication Flow**: Auth0 → JWT tokens → SecureStore → Redux state
- **Development Servers**: Frontend (Expo) on 8081, Backend (Ktor) on 8080

### File Structure Understanding
```
will-counter/
├── .claude/                  # Claude Code settings and context
│   ├── context.md           # This file - project memory
│   ├── CLAUDE.md            # Commands and quick reference
│   └── settings.json        # Claude Code configuration
├── .github/workflows/        # CI/CD pipelines
├── frontend/                 # React Native app
│   ├── __tests__/           # Jest tests with Expo mocks
│   ├── src/
│   │   ├── components/      # Feature-organized components
│   │   ├── contexts/        # AuthContext, UserContext
│   │   ├── navigation/      # React Navigation setup
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store and slices
│   │   └── config/          # Auth0, Supabase config
│   └── .eslintrc.js         # ESLint configuration
├── api/                     # Kotlin backend
│   └── src/main/kotlin/     # Source code
└── shared/                  # Shared utilities
```

## Development Workflow Context

### Common Tasks & Solutions
1. **Starting Development**: Export env vars for backend, start both frontend and backend servers
2. **Testing Changes**: Run frontend tests with proper Expo mocks, backend tests with Gradle
3. **Debugging Auth**: Check Auth0 dashboard, verify token storage, test logout flow
4. **Database Issues**: Check Supabase dashboard, verify RLS policies, test with service role key

### Known Working Configurations
- **Auth0**: Working JWT flow with proper audience configuration in `extraParams`
- **JWT Validation**: Only accepts 3-part JWT tokens, validates with JWK provider
- **Security**: Environment variable validation, no debug logging in production
- **Backend**: Secure Kotlin/Ktor API with proper error handling

### Development Best Practices Established
- **Error Handling**: Always wrap async operations in try/catch
- **Testing**: Mock all external dependencies (Expo, Auth0, Supabase)
- **Security**: Never commit actual environment variables, validate all inputs
- **Code Organization**: Feature-based component organization
- **State Management**: Use Redux Toolkit with typed selectors

## Debugging Context

### Recently Solved Issues (Current Session)
1. **Critical Authentication Bypass**: Fixed JWE token processing vulnerability in Auth0Config.kt
2. **JWT vs Opaque Token Issue**: Changed `additionalParameters` to `extraParams` in Auth0 configuration
3. **Environment Variable Injection**: Added regex validation to prevent command injection in Gradle build
4. **Authentication Flow**: Resolved persistent "Authentication required" errors in API endpoints

### Working Solutions (Current Session)
- **Security**: Fixed critical vulnerabilities, implemented proper JWT validation with 3-part tokens only
- **Auth0 Integration**: Working JWT token flow with proper audience parameter configuration  
- **Backend Security**: Environment variable sanitization, secure token verification with JWK provider
- **API Authentication**: All endpoints properly authenticate with Bearer tokens

This context helps Claude Code understand the current state and successful patterns in the Will Counter project.