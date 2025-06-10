# System Requirements Document (SRD)

## Technical Overview
- System Name: Will Counter Mobile App
- Version: 1.0.0
- Date: 2025/06/11
- Author: Tao

## System Architecture
### High-Level Architecture
The system will follow a serverless architecture with the following components:
1. Mobile Client (iOS/Android)
2. Backend Services
   - Supabase (Database, Storage)
   - Auth0 (Authentication)
   - Edge Functions (for custom logic)
3. Analytics Service

### Components
1. Frontend (Mobile App)
   - Technology Stack:
     - React Native (for cross-platform development)
     - TypeScript
     - React Context + useReducer for state management
   - Framework:
     - React Native
     - React Navigation for routing
   - UI Components:
     - Custom counter button
     - Statistics visualization
     - Auth0 authentication screens
     - Settings interface

2. Backend Services
   - Supabase:
     - Database:
       - PostgreSQL with Row Level Security
       - Real-time subscriptions
     - Storage:
       - File storage for app assets
     - Edge Functions:
       - Custom business logic
       - Background jobs
   - Auth0:
     - Authentication:
       - Universal Login
       - Social connections
       - Multi-factor authentication
       - Passwordless login
     - User Management:
       - User profiles
       - Role-based access
       - User metadata
   - APIs:
     - REST API
     - Real-time subscriptions
     - Storage API
     - Auth0 Management API

3. Infrastructure
   - Hosting:
     - Supabase Cloud
     - Auth0 Cloud
   - CDN:
     - Supabase Storage CDN
   - Security:
     - SSL/TLS encryption
     - Row Level Security
     - Auth0 security features

## Technical Requirements
### Performance Requirements
- Response Time:
  - Counter update: < 100ms
  - API calls: < 500ms
  - App launch: < 2 seconds
  - Authentication: < 1 second
- Throughput:
  - Support for 10,000+ concurrent users
  - Handle 100+ requests per second
- Scalability:
  - Supabase auto-scaling
  - Auth0 auto-scaling
  - Edge Functions for custom scaling

### Security Requirements
- Authentication:
  - Auth0 Universal Login
  - JWT-based authentication
  - Biometric authentication (optional)
  - Social login options
- Authorization:
  - Auth0 Roles and Permissions
  - Row Level Security
  - Role-based access control
- Data Protection:
  - End-to-end encryption
  - Secure data transmission (HTTPS)
  - Auth0 security features
- Compliance:
  - GDPR compliance
  - CCPA compliance
  - App Store guidelines
  - Auth0 compliance certifications

### Integration Requirements
- Third-party Services:
  - Auth0 Analytics
  - Supabase Analytics
  - Push Notification Service
  - Sound Library API
- External APIs:
  - Auth0 Management API
  - Analytics services
  - Push notification services

## Database Schema
### Users Table
```sql
create table users (
  id uuid primary key,
  auth0_id text unique not null,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  preferences jsonb default '{"soundEnabled": true, "notificationEnabled": true, "theme": "light"}'::jsonb
);

-- Enable Row Level Security
alter table users enable row level security;

-- Create policy
create policy "Users can only access their own data"
  on users for all
  using (auth.uid() = auth0_id);
```

### Will Counts Table
```sql
create table will_counts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  date date not null,
  count integer default 0,
  timestamps timestamp with time zone[] default array[]::timestamp with time zone[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Enable Row Level Security
alter table will_counts enable row level security;

-- Create policy
create policy "Users can only access their own counts"
  on will_counts for all
  using (auth.uid() = (select auth0_id from users where id = user_id));
```

## API Specifications
### Endpoints
1. Authentication (Auth0)
   - Universal Login
   - Social Connections
   - Password Reset
   - Email Verification

2. Counter
   - POST /rest/v1/will_counts
   - GET /rest/v1/will_counts
   - PATCH /rest/v1/will_counts

3. Statistics
   - GET /rest/v1/will_counts?select=count,date&date=gte.{date}

4. User Preferences
   - GET /rest/v1/users?select=preferences
   - PATCH /rest/v1/users?preferences=eq.{preferences}

## Development Environment
- Required Software:
  - Node.js (v18+)
  - React Native CLI
  - Xcode (for iOS)
  - Android Studio (for Android)
  - Supabase CLI
  - Auth0 CLI
- Development Tools:
  - VS Code
  - Git
  - Postman
  - Docker (for local development)
- Version Control:
  - Git
  - GitHub
- CI/CD Pipeline:
  - GitHub Actions
  - Fastlane for mobile deployment

## Testing Requirements
- Unit Testing:
  - Jest for JavaScript/TypeScript
  - React Native Testing Library
- Integration Testing:
  - API testing with Supertest
  - E2E testing with Detox
  - Supabase testing
  - Auth0 testing
- Performance Testing:
  - Load testing with k6
  - Mobile performance testing
- Security Testing:
  - OWASP security testing
  - Auth0 security testing
  - Penetration testing

## Deployment Requirements
- Deployment Process:
  - Automated CI/CD pipeline
  - Staging environment testing
  - Production deployment
- Environment Configuration:
  - Development
  - Staging
  - Production
- Monitoring:
  - Supabase Dashboard
  - Auth0 Dashboard
  - Error tracking with Sentry
  - Performance monitoring
- Backup Strategy:
  - Supabase automated backups
  - Auth0 backup
  - Point-in-time recovery
  - Disaster recovery plan

## Mobile-Specific Requirements
### iOS Requirements
- Minimum iOS Version: 13.0
- Device Support: iPhone and iPad
- App Store Guidelines Compliance
- Push Notification Support
- Background Processing
- Local Storage Management
- Auth0 iOS SDK integration

### Android Requirements
- Minimum Android Version: 8.0 (API 26)
- Device Support: Modern Android devices
- Play Store Guidelines Compliance
- Push Notification Support
- Background Processing
- Local Storage Management
- Auth0 Android SDK integration

### Cross-Platform Considerations
- Consistent UI/UX across platforms
- Platform-specific optimizations
- Offline functionality
- Battery usage optimization
- Memory management
- Network connectivity handling
- Auth0 cross-platform compatibility

## Maintenance
- Update Procedures:
  - Automated version updates
  - Database migration scripts
  - API versioning strategy
  - Auth0 configuration updates
- Monitoring:
  - Real-time error tracking
  - Performance monitoring
  - User analytics
  - Auth0 monitoring
- Support:
  - Error reporting system
  - User feedback mechanism
  - Documentation updates
  - Auth0 support 