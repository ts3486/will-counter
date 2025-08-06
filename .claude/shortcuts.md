# Claude Code Shortcuts - Will Counter

## Quick Development Commands

### Frontend Commands
```bash
# Development
cd frontend && npm start                    # Start Expo dev server
cd frontend && npm run android              # Launch Android simulator
cd frontend && npm run ios                  # Launch iOS simulator

# Testing & Quality
cd frontend && npm test                     # Run Jest tests
cd frontend && npm test -- --watch          # Watch mode
cd frontend && npm run lint                 # ESLint check

# Debugging
cd frontend && npx expo start --clear       # Clear cache and start
cd frontend && npx expo doctor              # Check configuration
cd frontend && npx expo logs               # View device logs
```

### Backend Commands
```bash
# Development
cd api && ./gradlew run                                    # Start server
cd api && export $(cat ../.env | xargs) && ./gradlew run  # With env vars
cd api && ./gradlew run --continuous                       # Auto-reload

# Testing & Building
cd api && ./gradlew test                    # Run tests
cd api && ./gradlew build                   # Build application
cd api && ./gradlew clean build            # Clean build
```

### Combined Workflows
```bash
# Full project setup
npm install && cd frontend && npm install && cd ../api

# Start both servers (run in separate terminals)
cd frontend && npm start & cd api && export $(cat ../.env | xargs) && ./gradlew run

# Run all tests
cd frontend && npm test && cd ../api && ./gradlew test

# Check everything
cd frontend && npm run lint && npm test && cd ../api && ./gradlew test build
```

## Environment Management

### Environment Variable Helpers
```bash
# Load and display environment variables
cat .env
export $(cat .env | xargs) && env | grep -E "(SUPABASE|AUTH0|API)"

# Check frontend environment
cd frontend && cat .env
cd frontend && npx expo config --type public

# Validate environment setup
echo $SUPABASE_URL
echo $AUTH0_DOMAIN
```

### Quick Environment Setup
```bash
# Copy example files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit environment files (use your preferred editor)
code .env frontend/.env
vim .env frontend/.env
nano .env frontend/.env
```

## Database Operations

### Supabase Quick Access
```bash
# Test connection with curl
curl -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/"

# Query users table
curl -H "apikey: $SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/users"

# Query will_counts table
curl -H "apikey: $SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/will_counts"
```

## Debugging Shortcuts

### Common Debug Scenarios
```bash
# Auth0 issues
echo "Check Auth0 dashboard: https://manage.auth0.com"
echo "Domain: $AUTH0_DOMAIN"
echo "Client ID: $AUTH0_CLIENT_ID"

# Database issues
echo "Supabase dashboard: https://supabase.com/dashboard"
echo "Project URL: $SUPABASE_URL"

# Clear application data (frontend)
cd frontend && npx expo start --clear

# Reset everything
rm -rf node_modules frontend/node_modules .expo frontend/.expo
npm install && cd frontend && npm install
```

### Log Analysis
```bash
# View frontend logs
cd frontend && npx expo logs --type ios
cd frontend && npx expo logs --type android

# View backend logs
cd api && ./gradlew run --info

# Monitor CI/CD
gh run list
gh run view --log
```

## Testing Shortcuts

### Quick Test Commands
```bash
# Frontend testing
cd frontend && npm test -- --coverage          # With coverage
cd frontend && npm test -- --watchAll=false    # Single run
cd frontend && npm test SettingsScreen         # Specific test

# Backend testing
cd api && ./gradlew test --info                # Verbose output
cd api && ./gradlew test --continue            # Continue on failure
```

### Mock Management
```bash
# Clear Jest cache
cd frontend && npx jest --clearCache

# Update snapshots
cd frontend && npm test -- --updateSnapshot

# Debug specific test
cd frontend && npm test -- --verbose ComponentName
```

## Build & Deploy Shortcuts

### Development Builds
```bash
# Frontend development build
cd frontend && npx expo export

# Backend development build
cd api && ./gradlew shadowJar

# Check build artifacts
ls -la frontend/dist/
ls -la api/build/libs/
```

### Production Preparation
```bash
# Install EAS CLI (if not installed)
npm install -g @expo/eas-cli

# Configure EAS
cd frontend && eas build:configure

# Build for testing
cd frontend && eas build --platform android --profile preview
```

## Git & CI/CD Shortcuts

### Git Workflow
```bash
# Quick commit workflow
git add .
git commit -m "feat: description"
git push

# Feature branch workflow
git checkout -b feature/name
# ... make changes ...
git add .
git commit -m "feat: description"
git push -u origin feature/name
gh pr create
```

### CI/CD Monitoring
```bash
# View GitHub Actions
gh run list
gh run watch

# Check specific workflow
gh run view --log <run-id>

# Re-run failed workflow
gh run rerun <run-id>
```

## Code Generation Shortcuts

### Component Generation Template
```bash
# Create new component directory
mkdir -p frontend/src/components/feature
cd frontend/src/components/feature

# Create component files
touch ComponentName.tsx
touch ComponentName.test.tsx
touch index.ts
```

### Redux Setup Template
```bash
# Create new slice
mkdir -p frontend/src/store/slices
cd frontend/src/store/slices
touch sliceName.ts
```

## Performance & Monitoring

### Bundle Analysis
```bash
# Analyze bundle size
cd frontend && npx expo export --dump-sourcemap
cd frontend && npx expo export --dev

# Check dependencies
cd frontend && npm ls --depth=0
cd frontend && npm outdated
```

### Health Checks
```bash
# Frontend health
cd frontend && npm doctor
cd frontend && npx expo doctor

# Backend health
cd api && ./gradlew check
cd api && ./gradlew dependencies

# Security audit
npm audit
cd frontend && npm audit
```

## Quick References

### Port Usage
- **Frontend (Expo)**: 8081 (Metro bundler)
- **Backend (Ktor)**: 8080 (API server)  
- **Database**: 5432 (Supabase PostgreSQL)

### Key Directories
- **Frontend source**: `frontend/src/`
- **Backend source**: `api/src/main/kotlin/`
- **Tests**: `frontend/__tests__/` and `api/src/test/`
- **Config**: Root `.env` and `frontend/.env`

### Important URLs
- **Expo DevTools**: http://localhost:19002
- **Backend API**: http://localhost:8080
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Auth0 Dashboard**: https://manage.auth0.com

### Emergency Reset Commands
```bash
# Nuclear option - reset everything
rm -rf node_modules frontend/node_modules .expo frontend/.expo
rm -rf api/build api/.gradle
npm install && cd frontend && npm install

# Clear all caches
cd frontend && npx expo start --clear
cd api && ./gradlew clean

# Reset git state (careful!)
git checkout .
git clean -fd
```

## Quick Fixes for Common Issues

### "Metro bundler not starting"
```bash
cd frontend && npx expo start --clear --reset-cache
```

### "Gradle build failing"
```bash
cd api && ./gradlew clean && ./gradlew build
```

### "Auth0 login not working"
```bash
# Check environment variables
echo $AUTH0_DOMAIN $AUTH0_CLIENT_ID
# Clear secure storage in app
# Check Auth0 dashboard settings
```

### "Database connection issues"
```bash
# Test Supabase connection
curl -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/"
# Check environment variables
echo $SUPABASE_URL $SUPABASE_ANON_KEY
```

These shortcuts cover the most common development tasks and debugging scenarios in the Will Counter project.