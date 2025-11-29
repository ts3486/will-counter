# Will Counter

A mobile application for tracking and strengthening willpower through conscious resistance tracking. Built as a monorepo with React Native frontend, Rust (Axum) API backend, and Supabase database.

## Features

### 🎯 Core Features
- **Will Counter**: Simple one-tap counting for willpower exercises
- **Real-time Feedback**: Sound and haptic feedback for positive reinforcement
- **Daily Statistics**: Track progress with visual charts and insights
- **Secure Authentication**: Auth0 integration with social login options
- **Offline Support**: Continue tracking even without internet connection
- **Cross-platform**: Native iOS and Android support

### 🏗️ Technical Features
- **Redux State Management**: Predictable state updates and caching
- **Real-time Sync**: Supabase real-time subscriptions
- **Row Level Security**: Database-level security policies
- **Error Boundaries**: Graceful error handling and recovery
- **TypeScript**: Full type safety across the application
- **Offline-first**: Smart sync when connection is restored

## Project Structure

```
will-counter/
├── backend/                 # Rust Axum API backend (Cargo project + Dockerfile)
│   └── api/                 # Axum service source
├── frontend/                # React Native mobile app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store/          # Redux store and slices
│   │   ├── services/       # API and utility services
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── __tests__/          # Test files
│   └── package.json        # Dependencies and scripts
├── shared/                  # Shared types and utilities
│   ├── types/              # TypeScript type definitions
│   ├── database/           # Database schema
│   └── supabase.ts         # Supabase client configuration
└── docs/                   # Documentation
```

## Quick Start

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)
- Supabase account
- Auth0 account

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd will-counter
   # Backend
   cd backend/api && cargo fetch
   # Frontend
   cd ../../frontend && npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and Auth0 credentials
   ```

3. **Set up Supabase:**
   ```bash
   # Create your Supabase project and run the SQL schema
   # Copy shared/database/schema.sql to your Supabase SQL editor
   ```

4. **Configure Auth0:**
   - Create Auth0 application
   - Configure callback URLs for React Native
   - Set up user permissions and roles

5. **Start development servers:**
   ```bash
   # Terminal 1 - Start API (Axum)
   cd backend/api && cargo run
   
   # Terminal 2 - Start React Native Metro
   cd frontend && npm start
   
   # Terminal 3 - Run on device/simulator
   npm run android  # or npm run ios (from frontend/)
   ```

## Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL schema from `shared/database/schema.sql`
3. Configure Row Level Security policies
4. Get your project URL and anon key

### Auth0 Setup
1. Create a new Auth0 application (Native)
2. Configure allowed callback URLs:
   - `willcounter://dev-callback` (development)
   - `willcounter://callback` (production)
3. Enable desired social connections
4. Configure user metadata and permissions

### Environment Variables
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=your-api-audience
```

## Development

### Frontend Architecture
- **React Native + TypeScript**: Type-safe mobile development
- **Redux Toolkit**: State management with async thunks
- **React Navigation**: Navigation and routing
- **Auth0 React Native**: Authentication and authorization
- **Supabase JS**: Database operations and real-time subscriptions

### Claude Actions (AI-Powered Automation)
This repository includes automated workflows powered by Claude (Anthropic's LLM):
- 🤖 **Automated PR Reviews**: Intelligent code review feedback on pull requests
- 🔍 **Issue Analysis**: Automatic triage and labeling of new issues
- 📚 **Documentation Generation**: Auto-updated API and frontend documentation
- 🛡️ **Security Scanning**: Detection of security-sensitive code patterns

**Setup**: Add your `ANTHROPIC_API_KEY` to repository secrets. See [Claude Actions Documentation](.github/workflows/README.md) for full setup guide.

### State Management
```typescript
// Store structure
{
  auth: {
    isAuthenticated: boolean
    user: User | null
    loading: boolean
  },
  willCounter: {
    todayCount: number
    currentRecord: WillCount | null
    loading: boolean
  },
  user: {
    preferences: UserPreferences
    statistics: UserStatistics[]
  }
}
```

### Offline Support
- **MMKV**: Fast local storage for increments
- **AsyncStorage**: Cached user data
- **Network Detection**: Automatic online/offline detection
- **Smart Sync**: Background sync when connection restored

## API Reference

### Supabase Functions
```sql
-- Get or create today's count record
get_or_create_today_count(p_user_id UUID)

-- Increment will count atomically
increment_will_count(p_user_id UUID)

-- Get user statistics for date range
get_user_statistics(p_user_id UUID, p_days INTEGER)
```

### Database Schema
- **users**: User profiles and preferences
- **will_counts**: Daily count records with timestamps
- **RLS Policies**: Row-level security for data isolation

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Unit Tests**: Component and utility testing
- **Integration Tests**: Redux store and API integration
- **E2E Tests**: Full user flow testing (planned)

## Deployment

### Mobile App Deployment
```bash
# Build for production
cd frontend

# Android
npm run build:android

# iOS
npm run build:ios
```

### Environment Setup
- **Development**: Local development with simulators
- **Staging**: TestFlight/Play Console internal testing
- **Production**: App Store/Play Store release

## Performance

### Optimization Features
- **Redux Persistence**: State hydration from storage
- **Image Optimization**: Optimized assets and loading
- **Code Splitting**: Lazy loading of components
- **Bundle Analysis**: Size monitoring and optimization

### Monitoring
- **Error Boundaries**: Graceful error handling
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Load time and interaction tracking

## Security

### Data Protection
- **Auth0 Security**: Industry-standard authentication
- **Row Level Security**: Database-level access control
- **JWT Verification**: Secure API authentication
- **HTTPS Only**: Encrypted data transmission

### Privacy
- **GDPR Compliance**: User data rights and deletion
- **Minimal Data**: Only collect necessary information
- **Local Storage**: Sensitive data stored locally when possible

## Scripts Reference

```bash
# Backend
cd backend/api && cargo run                 # Start Rust Axum API server
cd backend/api && cargo build --release     # Build Rust API binary

# Frontend
cd frontend && npm start                     # Start React Native Metro
cd frontend && npm run android               # Run Android app
cd frontend && npm run ios                   # Run iOS app
cd frontend && npm test                      # Run tests
cd frontend && npm run lint                  # Lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the implementation plan checklist
