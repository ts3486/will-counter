# Will Counter

A monorepo application for tracking will power activities with:
- **Backend**: Kotlin API with Ktor framework
- **Frontend**: React Native with TypeScript  
- **Database**: Supabase (PostgreSQL)

## Project Structure

```
will-counter/
├── api/              # Kotlin API backend
├── frontend/         # React Native mobile app
├── shared/           # Shared types and utilities
└── docs/             # Documentation
```

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development servers:**
   ```bash
   # Terminal 1 - Start API
   npm run dev:api
   
   # Terminal 2 - Start React Native
   npm run dev:frontend
   
   # Terminal 3 - Run on Android
   npm run android
   
   # Or run on iOS
   npm run ios
   ```

## Development

### API (Kotlin)
- Built with Ktor framework
- Runs on port 8080
- Database integration with Exposed ORM

### Frontend (React Native)
- TypeScript support
- Supabase client integration
- Cross-platform (iOS/Android)

### Database (Supabase)
- PostgreSQL with real-time subscriptions
- Authentication and authorization
- Row Level Security (RLS)

## Scripts

- `npm run dev:api` - Start Kotlin API server
- `npm run dev:frontend` - Start React Native Metro bundler  
- `npm run android` - Run Android app
- `npm run ios` - Run iOS app
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint all packages
- `npm run clean` - Clean all build artifacts