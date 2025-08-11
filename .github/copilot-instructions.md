# Will Counter - Mobile Willpower Tracking App

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Environment Setup
- Install Node.js 18+ and Java 17 before proceeding with any build operations
- Verify versions: `node --version` and `java -version`
- This is a monorepo with npm workspaces: api (Kotlin/Ktor), frontend (React Native/Expo), shared (TypeScript)

### Bootstrap and Build Process
- **Initial Setup**: Run `npm install` in project root - takes ~3 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
- **API Build**: Run `cd api && ./gradlew build` - first build takes ~5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
  - Subsequent builds are much faster (~1 minute) due to Gradle daemon
- **Frontend Dependencies**: Automatically handled by npm workspaces during root install
- **Complete Setup**: Run `npm run install:all` for full setup (npm install + API build) - takes ~5 minutes total. NEVER CANCEL. Set timeout to 10+ minutes.

### Testing
- **Frontend Tests**: `cd frontend && npm test` - takes ~8 seconds. Set timeout to 30+ seconds.
  - With coverage: `cd frontend && npm test -- --coverage --watchAll=false`
- **API Tests**: `cd api && ./gradlew test` - takes ~2 seconds (after initial build). Set timeout to 30+ seconds.
- **WARNING**: Root-level `npm run test` FAILS - api and shared packages have broken/missing test scripts. Always test packages individually.

### Linting  
- **Frontend Lint**: `cd frontend && npm run lint` - takes <1 second
- **WARNING**: Root-level `npm run lint` FAILS - api and shared packages don't have lint scripts. Always lint packages individually.

### Development Servers
- **Start API Server**: `cd api && ./gradlew run` - starts on http://0.0.0.0:8080
  - Health check available at: `curl http://localhost:8080/health`  
  - Shows Supabase configuration warnings without .env file (this is expected)
- **Start Frontend Metro**: `cd frontend && npm start` - starts Expo Metro bundler
  - Runs in CI mode when CI=true environment variable is set
  - Use `npm run android` or `npm run ios` to launch on devices/simulators

### Production Builds
- **Frontend Build**: `cd frontend && npm run build` - exports for distribution, takes ~1 minute. NEVER CANCEL. Set timeout to 3+ minutes.
- **API Build**: `cd api && ./gradlew build` - produces JAR for deployment

## Configuration

### Environment Setup
- Copy `api/.env.example` to `api/.env` and configure:
  - Supabase URL and keys  
  - Auth0 domain, client ID, and secrets
  - Database URL for PostgreSQL connection
- Required for full authentication and database functionality

### Database Setup (Supabase)
- Create new Supabase project
- Run SQL schema from `shared/database/schema.sql` in Supabase SQL editor  
- Schema includes Row Level Security policies and functions for will counting
- Functions: `get_or_create_today_count()`, `increment_will_count()`, `get_user_statistics()`

### Auth0 Setup  
- Create Auth0 Native application
- Configure callback URLs: `willcounter://dev-callback` (dev), `willcounter://callback` (prod)
- Enable desired social connections

## Validation Scenarios

Always validate changes using these complete scenarios:

### API Validation
1. Build API: `cd api && ./gradlew build`
2. Start API server: `cd api && ./gradlew run` 
3. Test health endpoint: `curl http://localhost:8080/health`
4. Verify response: "API is running and healthy"
5. Stop server with Ctrl+C

### Frontend Validation  
1. Start Metro server: `cd frontend && npm start`
2. Verify Metro starts without errors and shows "Waiting on http://localhost:8081"
3. Run tests: `cd frontend && npm test -- --watchAll=false`  
4. Verify all test suites pass
5. Test build process: `cd frontend && npm run build`
6. Verify export completes successfully with bundle files created

### Integration Testing
- API and frontend can run simultaneously on different ports (8080 and 8081)
- Test authentication flows require proper .env configuration
- Database operations require Supabase setup with provided schema

## Critical Build Warnings

- **NEVER CANCEL BUILD COMMANDS** - Initial Gradle builds take 5-10 minutes
- **ALWAYS use long timeouts**: 10+ minutes for builds, 3+ minutes for exports
- **First builds are slow** - Gradle downloads dependencies and sets up daemon
- **Subsequent builds are fast** - Gradle daemon caches everything after first run
- **Do not use root-level npm scripts** - test and lint fail due to missing scripts in workspaces

## Common Tasks Reference

### Quick Commands
```bash
# Full setup from fresh clone
npm install && npm run install:all

# Individual package operations  
cd frontend && npm run lint && npm test
cd api && ./gradlew test && ./gradlew build

# Start development environment
cd api && ./gradlew run &  # Start API in background
cd frontend && npm start   # Start Metro in foreground

# Production builds
cd api && ./gradlew build
cd frontend && npm run build
```

### Project Structure
```
will-counter/
├── api/                    # Kotlin/Ktor backend (port 8080)
│   ├── src/main/kotlin/    # Application source  
│   ├── build.gradle.kts    # Gradle build config
│   ├── .env.example        # Environment template
│   └── gradlew            # Gradle wrapper
├── frontend/               # React Native/Expo app (port 8081)  
│   ├── src/               # React components and logic
│   ├── __tests__/         # Jest test suites
│   └── package.json       # Dependencies and scripts
├── shared/                # TypeScript types and utilities
│   ├── database/          # SQL schema files
│   └── supabase.ts        # Database client config
└── package.json           # Root workspace config
```

### Troubleshooting
- **Gradle build fails**: Ensure Java 17 is installed
- **Metro fails to start**: Check Node.js 18+ requirement  
- **API health check fails**: Verify server started on correct port 8080
- **Authentication errors**: Check .env file configuration
- **Database errors**: Verify Supabase setup and schema installation

Always run linting and tests before committing changes. The CI pipeline expects individual package testing, not root-level commands.