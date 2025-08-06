# Will Counter - Claude Code Project Memory

## Project Overview
Will Counter is a React Native/Expo mobile application for tracking willpower exercises with a Kotlin/Ktor backend API. The app helps users build mental resilience by counting and tracking their daily willpower activities.

## Architecture
- **Frontend**: React Native + Expo (TypeScript)
- **Backend**: Kotlin + Ktor (REST API)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Auth0
- **State Management**: Redux Toolkit
- **CI/CD**: GitHub Actions

## Key Technologies
- **Mobile**: Expo 53, React Native 0.79, TypeScript
- **API**: Kotlin, Ktor 2.3, Gradle 8.13
- **Database**: Supabase with direct REST API access
- **Auth**: Auth0 OAuth with JWT tokens
- **Testing**: Jest, React Test Renderer
- **Deployment**: EAS Build (planned)

## Project Structure
```
will-counter/
├── frontend/          # React Native Expo app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React contexts (Auth, User)
│   │   ├── navigation/    # React Navigation setup
│   │   ├── services/      # API services, analytics
│   │   ├── store/         # Redux store and slices
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── __tests__/     # Jest tests
├── api/               # Kotlin Ktor backend
│   └── src/main/kotlin/com/willcounter/api/
│       ├── config/        # Database, Auth0 config
│       ├── models/        # Data models
│       ├── routes/        # API endpoints
│       └── services/      # Business logic
└── shared/            # Shared utilities
```

## Current State & Features

### ✅ Implemented Features
- **Authentication**: Auth0 login/logout with secure token storage
- **Will Counter**: Track daily willpower exercises with increment/reset
- **Settings**: User preferences, daily goals, account management
- **Navigation**: Bottom tabs (Counter, Settings)
- **State Management**: Redux with persistent storage
- **Testing**: Comprehensive Jest test suite
- **CI/CD**: GitHub Actions for testing and security

### 🔧 Technical Details
- **Database Access**: Frontend connects directly to Supabase REST API (bypassing backend for now)
- **Authentication Flow**: Auth0 → JWT tokens → Secure storage
- **Data Storage**: Supabase tables (users, will_counts) with UUID primary keys
- **API Design**: RESTful endpoints with JWT validation
- **Error Handling**: Comprehensive error boundaries and try/catch blocks

## Environment Setup

### Required Environment Variables
```bash
# Backend (.env)
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_key]
AUTH0_DOMAIN=[domain].auth0.com
AUTH0_CLIENT_ID=[client_id]
AUTH0_CLIENT_SECRET=[client_secret]
AUTH0_AUDIENCE=https://[domain].auth0.com/api/v2/
API_PORT=8080
API_HOST=0.0.0.0

# Frontend (frontend/.env)
EXPO_PUBLIC_SUPABASE_URL=https://[project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
EXPO_PUBLIC_AUTH0_DOMAIN=[domain].auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=[client_id]
EXPO_PUBLIC_AUTH0_CLIENT_SECRET=[client_secret]
EXPO_PUBLIC_AUTH0_AUDIENCE=https://[domain].auth0.com/api/v2/
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Development Commands

### Frontend
```bash
cd frontend
npm install
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm test           # Run Jest tests
npm run lint       # Run ESLint
```

### Backend
```bash
cd api
./gradlew run                                    # Start development server
./gradlew test                                   # Run tests
./gradlew build                                  # Build application
export $(cat ../.env | xargs) && ./gradlew run  # Run with env vars
```

## Database Schema
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Will counts table  
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

## Recent Changes & Context

### Latest Updates
- **Fixed Auth0 logout popup issue**: Removed WebBrowser call that was causing unwanted login popup after logout
- **Added logout success message**: Users now see confirmation when logout completes
- **Fixed CI/CD pipelines**: Resolved frontend test cache issues and security scan permissions
- **Enhanced test coverage**: Added comprehensive mocks for Expo modules in Jest tests
- **Security improvements**: Fixed npm audit vulnerabilities

### Known Issues & Technical Debt
- **Frontend connects directly to Supabase**: Should eventually route through backend API
- **Test user hardcoded**: Uses 'test-user-1' for development/testing
- **Statistics feature commented out**: Needs implementation
- **Error handling**: Could be more granular in some areas

## Development Guidelines

### Code Patterns
- **React Components**: Use functional components with hooks
- **State Management**: Use Redux Toolkit with typed selectors
- **API Calls**: Use async/await with proper error handling  
- **Authentication**: Always check auth state before API calls
- **Testing**: Mock external dependencies (Expo, Auth0, Supabase)

### Security Best Practices
- **Never commit secrets**: Use .env files (already in .gitignore)
- **Use service role key only in backend**: Frontend uses anon key
- **Validate all inputs**: Sanitize user data before database operations
- **JWT token validation**: Backend validates all Auth0 tokens

## Useful Commands for Claude Code Users

### Quick Development Setup
```bash
# Install all dependencies
npm install && cd frontend && npm install && cd ../api

# Start development servers (separate terminals)
cd frontend && npm start
cd api && export $(cat ../.env | xargs) && ./gradlew run

# Run all tests
cd frontend && npm test && cd ../api && ./gradlew test

# Check code quality
cd frontend && npm run lint
```

### Common Development Tasks
```bash
# Reset database for user
# (Connect to Supabase dashboard and run SQL)

# View logs
cd api && ./gradlew run --info
cd frontend && npx expo start --clear

# Build for production
cd frontend && npm run build
cd api && ./gradlew build
```

## Contact & Resources
- **Auth0 Dashboard**: https://manage.auth0.com
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Expo Documentation**: https://docs.expo.dev
- **Ktor Documentation**: https://ktor.io/docs