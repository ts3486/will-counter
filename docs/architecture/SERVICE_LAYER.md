# Service Layer Architecture

## Overview

The Will Counter application now implements a proper service layer architecture to improve maintainability, testability, and separation of concerns. This document outlines the architectural decisions and patterns used.

## Architecture Layers

### 1. Service Layer

The service layer provides an abstraction between the UI components and data sources (Supabase). It consists of:

#### Service Interfaces (`src/services/interfaces/`)
- **IBaseService**: Common interface for all services with initialization, disposal, and health checks
- **IUserService**: Interface for user-related operations
- **IWillCountService**: Interface for will count data operations

#### Service Implementations (`src/services/implementations/`)
- **BaseService**: Abstract base class providing common functionality (retry logic, error handling, logging)
- **UserService**: Concrete implementation for user operations using Supabase
- **WillCountService**: Concrete implementation for will count operations using Supabase

#### Service Container (`src/services/ServiceContainer.ts`)
- Dependency injection container for managing service instances
- Singleton pattern for global service access
- Health monitoring for all services
- Centralized initialization and disposal

### 2. Error Handling

#### Error Boundaries (`src/components/shared/ErrorBoundary.tsx`)
- React Error Boundaries for catching rendering errors
- Automatic error recovery mechanisms
- Custom fallback UI components
- Higher-order component pattern for easy integration

#### Error Utilities (`src/utils/errorHandler.ts`)
- Centralized error handling and classification
- Structured error objects with error codes
- Integration with logging services

### 3. Data Flow

```
UI Components → Redux Actions → Service Layer → Supabase API
     ↓              ↓              ↓              ↓
Error Boundaries ← Error Handling ← Service Responses ← API Responses
```

## Key Design Patterns

### 1. Service Pattern
- **Purpose**: Encapsulate business logic and data access
- **Benefits**: Testability, reusability, separation of concerns
- **Implementation**: Interface-based design with dependency injection

### 2. Repository Pattern (within services)
- **Purpose**: Abstract data access logic
- **Benefits**: Consistent data operations, easier testing
- **Implementation**: Service methods handle all database interactions

### 3. Error Boundary Pattern
- **Purpose**: Graceful error handling in React components
- **Benefits**: Prevents app crashes, better user experience
- **Implementation**: HOC and component-based error boundaries

### 4. Dependency Injection
- **Purpose**: Manage service dependencies and configuration
- **Benefits**: Testability, flexibility, centralized configuration
- **Implementation**: ServiceContainer singleton with initialization

## Service Layer Benefits

### 1. Improved Testability
- Services can be easily mocked for unit testing
- Clear interfaces define expected behavior
- Isolated business logic testing

### 2. Better Error Handling
- Consistent error response format
- Retry logic for transient failures
- Proper error classification and logging

### 3. Separation of Concerns
- UI components focus on presentation
- Services handle business logic and data access
- Clear boundaries between layers

### 4. Maintainability
- Changes to data sources only affect service implementations
- Business logic centralized in services
- Clear code organization and structure

## Migration Strategy

The new service layer is designed to coexist with the existing API service:

1. **Phase 1**: Service layer created alongside existing code
2. **Phase 2**: Redux slices updated to use new service layer
3. **Phase 3**: Components enhanced with error boundaries
4. **Phase 4**: Legacy API service deprecated (future work)

## Usage Examples

### Service Initialization
```typescript
import { serviceContainer } from './services/ServiceContainer';

// Initialize services
await serviceContainer.initialize({
  supabaseUrl: 'your-supabase-url',
  supabaseAnonKey: 'your-anon-key',
  supabaseServiceKey: 'your-service-key'
});

// Use services
const userService = serviceContainer.getUserService();
const result = await userService.createUser('auth0-id', 'email@example.com');
```

### Error Boundary Usage
```typescript
import { withErrorBoundary } from './components/shared/ErrorBoundary';

// Wrap component with error boundary
export default withErrorBoundary(MyComponent, {
  onError: (error) => console.error('Component error:', error)
});
```

### Service Response Handling
```typescript
const result = await willCountService.incrementCount(userId);
if (result.success) {
  // Handle success
  console.log('Count incremented:', result.data);
} else {
  // Handle error
  console.error('Error:', result.error);
}
```

## Future Improvements

1. **Service Worker Integration**: For offline support
2. **Caching Layer**: Redis or in-memory caching for frequently accessed data
3. **Service Discovery**: Dynamic service registration and discovery
4. **Metrics and Monitoring**: Service performance and health metrics
5. **API Gateway**: Centralized API management and routing

## Testing Strategy

### Unit Tests
- Mock service dependencies
- Test service logic in isolation
- Verify error handling scenarios

### Integration Tests
- Test service interactions with real database
- Verify data consistency and transactions
- Test error recovery mechanisms

### Component Tests
- Test error boundary behavior
- Verify service integration in components
- Test user interaction flows

## Configuration

### Environment Variables
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SUPABASE_SERVICE_KEY=your-service-key (optional)
```

### Service Configuration
```typescript
interface ServiceConfig {
  retryAttempts?: number;  // Default: 3
  timeoutMs?: number;      // Default: 30000
  enableLogging?: boolean; // Default: true
}
```

## Troubleshooting

### Common Issues

1. **Service Not Initialized**
   - Ensure `serviceContainer.initialize()` is called before using services
   - Check that configuration is provided

2. **Authentication Errors**
   - Verify Supabase keys are correct
   - Check RLS policies for proper permissions

3. **Network Errors**
   - Services include retry logic for transient failures
   - Check network connectivity and Supabase status

4. **Component Errors**
   - Error boundaries will catch and display user-friendly messages
   - Check console for detailed error information

### Debugging

- Enable service logging by setting `enableLogging: true` in service config
- Use React Developer Tools to inspect error boundary state
- Monitor network requests in browser developer tools
- Check Supabase logs for database-related issues