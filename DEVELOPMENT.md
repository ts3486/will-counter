# Will Counter - Development Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Expo CLI
- Android Studio / Xcode (for mobile testing)

### Setup
```bash
# Clone and install dependencies
git clone <repository>
cd will-counter
npm install
cd frontend && npm install

# Set up environment variables
cp .env.example .env
cp frontend/.env.example frontend/.env
# Edit .env files with your actual values

# Start development servers (separate terminals)
cd frontend && npm start
cd api && export $(cat ../.env | xargs) && ./gradlew run
```

## Development Workflow

### Frontend Development
```bash
cd frontend

# Start Expo development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Testing
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run lint          # ESLint

# Building
npm run build         # Export for web
eas build            # Build for mobile (requires EAS CLI)
```

### Backend Development
```bash
cd api

# Development
./gradlew run                                    # Start server
export $(cat ../.env | xargs) && ./gradlew run  # With env vars

# Testing
./gradlew test        # Run tests
./gradlew build       # Build application
./gradlew check       # Run all checks
```

## Architecture Overview

### Frontend Stack
- **React Native**: Mobile development framework
- **Expo**: Development platform and build service
- **TypeScript**: Type-safe JavaScript
- **Redux Toolkit**: State management
- **React Navigation**: Navigation library
- **Expo Auth Session**: OAuth authentication
- **Expo Secure Store**: Secure credential storage

### Backend Stack
- **Kotlin**: Programming language
- **Ktor**: Web framework
- **Gradle**: Build tool
- **Exposed**: SQL DSL for database operations
- **HikariCP**: Connection pooling
- **Auth0 JWT**: Authentication verification

### External Services
- **Supabase**: PostgreSQL database with REST API
- **Auth0**: Authentication and user management
- **GitHub Actions**: CI/CD pipeline

## Project Structure

```
will-counter/
├── frontend/                 # React Native Expo application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── counter/     # Will counter components
│   │   │   ├── settings/    # Settings components
│   │   │   ├── shared/      # Shared components
│   │   │   └── statistics/  # Statistics components
│   │   ├── contexts/        # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── UserContext.tsx
│   │   ├── navigation/      # Navigation configuration
│   │   │   ├── AppNavigator.tsx
│   │   │   └── TabNavigator.tsx
│   │   ├── services/        # External service integrations
│   │   │   ├── api.ts       # API service layer
│   │   │   └── AnalyticsService.ts
│   │   ├── store/           # Redux store and slices
│   │   │   ├── store.ts
│   │   │   └── slices/
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── __tests__/           # Jest tests
│   ├── .eslintrc.js         # ESLint configuration
│   ├── jest.config.js       # Jest configuration
│   └── package.json
├── api/                     # Kotlin Ktor backend
│   └── src/main/kotlin/com/willcounter/api/
│       ├── config/          # Configuration
│       │   ├── Auth0Config.kt
│       │   └── DatabaseConfig.kt
│       ├── models/          # Data models
│       ├── routes/          # API endpoints
│       └── services/        # Business logic
├── shared/                  # Shared utilities
├── .github/workflows/       # CI/CD pipelines
├── CLAUDE.md               # Claude Code project memory
├── .claude/                # Claude Code settings
└── docs/                   # Project documentation
```

## Key Features

### Authentication Flow
1. User initiates login via Auth0
2. Auth0 redirects with authorization code
3. Frontend exchanges code for JWT tokens
4. Tokens stored securely in Expo Secure Store
5. Backend validates JWT tokens for API access

### Will Counter Functionality
1. Display current day's count
2. Increment count with button press
3. Reset count to zero (with confirmation)
4. Persist data to Supabase database
5. Sync across user sessions

### Settings Management
1. Daily goal configuration
2. User preferences
3. Account management (logout)
4. Data reset functionality

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Will Counts Table
```sql
CREATE TABLE will_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    count INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    timestamps TIMESTAMPTZ[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component rendering and logic
- **Integration Tests**: Service interactions
- **Mocking Strategy**: Mock Expo modules and external services

```typescript
// Example test setup
jest.mock('expo-auth-session', () => ({
  useAuthRequest: () => [null, null, jest.fn()],
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));
```

### Backend Testing
- **Unit Tests**: Business logic and utilities
- **Integration Tests**: API endpoint testing
- **Database Tests**: Repository layer testing

## Environment Configuration

### Required Environment Variables

#### Backend (.env)
```bash
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_key]
AUTH0_DOMAIN=[domain].auth0.com
AUTH0_CLIENT_ID=[client_id]
AUTH0_CLIENT_SECRET=[client_secret]
AUTH0_AUDIENCE=https://[domain].auth0.com/api/v2/
API_PORT=8080
API_HOST=0.0.0.0
```

#### Frontend (frontend/.env)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://[project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
EXPO_PUBLIC_AUTH0_DOMAIN=[domain].auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=[client_id]
EXPO_PUBLIC_AUTH0_CLIENT_SECRET=[client_secret]
EXPO_PUBLIC_AUTH0_AUDIENCE=https://[domain].auth0.com/api/v2/
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Common Development Tasks

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement frontend components in `src/components/feature/`
3. Add Redux slice if needed in `src/store/slices/`
4. Implement backend endpoints in `api/src/main/kotlin/.../routes/`
5. Write tests for both frontend and backend
6. Update documentation

### Debugging Common Issues

#### Authentication Issues
- Check Auth0 dashboard configuration
- Verify environment variables
- Clear Expo Secure Store: `await SecureStore.deleteItemAsync('accessToken')`
- Test in incognito browser window

#### Database Issues
- Check Supabase dashboard
- Verify RLS (Row Level Security) policies
- Test with service role key bypass
- Check database schema matches code expectations

#### Build Issues
- Clear caches: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for conflicting packages: `npm ls`

#### Test Issues
- Update Jest mocks for new Expo modules
- Check for missing test setup in jest.config.js
- Verify mock implementations match actual APIs

## CI/CD Pipeline

### GitHub Actions Workflows
- **Test Frontend**: ESLint, Jest tests
- **Test API**: Gradle tests and build
- **Security Scan**: Trivy vulnerability scanning
- **Build Android**: EAS build for Android (on main branch)

### Deployment Strategy
1. **Development**: Local development servers
2. **Staging**: Deploy to TestFlight/Firebase App Distribution
3. **Production**: App Store/Google Play Store

## Performance Considerations

### Frontend Optimization
- Use React.memo for expensive components
- Implement useMemo/useCallback for heavy computations
- Optimize images and use appropriate formats
- Lazy load screens and components
- Monitor bundle size with `npx expo install --fix`

### Backend Optimization
- Use connection pooling (HikariCP)
- Implement proper database indexing
- Cache frequently accessed data
- Monitor API response times
- Use async/await for non-blocking operations

## Security Best Practices

### Frontend Security
- Store sensitive data in Expo Secure Store only
- Validate all user inputs
- Use HTTPS for all API calls
- Implement proper error handling (don't leak sensitive info)

### Backend Security
- Validate JWT tokens on all protected endpoints
- Use parameterized queries to prevent SQL injection
- Implement rate limiting
- Log security events
- Keep dependencies updated

## Contributing

### Code Style
- Use TypeScript for type safety
- Follow existing naming conventions
- Write descriptive commit messages
- Add tests for new functionality
- Update documentation for significant changes

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Run all tests and linting locally
4. Create pull request with clear description
5. Address review feedback
6. Merge after approval and passing CI

## Resources

### Documentation Links
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Ktor Documentation](https://ktor.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Auth0 Documentation](https://auth0.com/docs)

### Development Tools
- [Expo Dev Tools](https://docs.expo.dev/workflow/debugging/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Flipper](https://fbflipper.com/) (React Native debugging)

### Useful Commands Reference
```bash
# Development
npm start                    # Start Expo dev server
./gradlew run               # Start Kotlin backend
npm test                    # Run frontend tests
./gradlew test             # Run backend tests

# Debugging
npx expo start --clear      # Clear Expo cache
npx expo doctor            # Check Expo configuration
./gradlew clean build      # Clean build backend

# Production
eas build                   # Build mobile app
./gradlew shadowJar        # Build backend JAR
```