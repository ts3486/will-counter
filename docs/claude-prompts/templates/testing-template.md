# Claude Prompt Template: Testing Strategy

## 🎯 Purpose
Generate comprehensive testing strategies and implementations for Will Counter features including unit tests, integration tests, and E2E testing.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a senior QA engineer and test automation specialist with expertise in React Native testing, Kotlin testing, and mobile app quality assurance. Create comprehensive testing strategies for the Will Counter application.

**PROJECT CONTEXT**:
- **Frontend**: React Native/Expo with TypeScript, Redux Toolkit
- **Backend**: Kotlin/Ktor with Exposed ORM
- **Database**: Supabase PostgreSQL
- **Testing Tools**: Jest, React Testing Library, Kotlin Test, Detox (E2E)
- **Platforms**: iOS and Android mobile applications

**TESTING FRAMEWORK SETUP**:
```typescript
// Frontend testing stack
- Jest: JavaScript testing framework
- React Testing Library: React Native component testing
- MSW: API mocking for integration tests
- Detox: E2E testing for React Native

// Backend testing stack
- Kotlin Test: Unit testing framework
- MockK: Mocking library for Kotlin
- Testcontainers: Database testing with real PostgreSQL
```

**EXISTING TEST PATTERNS**:
- Component tests in `/frontend/__tests__/components/`
- Service tests in `/api/src/test/kotlin/`
- Integration tests in `/frontend/__tests__/integration/`
- E2E tests in `/e2e/` (if exists)

## TESTING REQUIREMENT

**Feature/Component to Test**: [Name of feature, component, or functionality]

**Testing Scope**: [Choose applicable areas]
- [ ] **Unit Testing**: Individual components and functions
- [ ] **Integration Testing**: API and database interactions
- [ ] **Component Testing**: React Native UI components
- [ ] **E2E Testing**: Complete user journeys
- [ ] **Performance Testing**: Load and stress testing
- [ ] **Security Testing**: Authentication and authorization
- [ ] **Accessibility Testing**: Screen reader and usability

**Code Under Test**:
```typescript
// Paste the component, service, or function to be tested
```

**Specific Testing Concerns**:
- [List specific edge cases, error scenarios, or business logic to test]

## TESTING FOCUS AREAS

### Frontend Testing Priorities:
- User interactions and touch events
- Redux state management and async actions
- Navigation and routing
- Offline/online state handling
- Form validation and submission
- Error handling and user feedback

### Backend Testing Priorities:
- API endpoint functionality
- Database operations and transactions
- Authentication and authorization
- Input validation and sanitization
- Error handling and status codes
- Business logic and calculations

### Integration Testing Priorities:
- Frontend-backend API communication
- Database query correctness
- Auth0 token validation
- Real-time subscription handling
- Offline sync mechanisms

## OUTPUT FORMAT

Please provide comprehensive testing implementation:

### 🧪 Testing Strategy Overview

#### Test Pyramid Structure
```
    /\     E2E Tests (Few)
   /  \    - Critical user journeys
  /____\   - Cross-platform validation
 /      \  
/________\  Integration Tests (Some)
          \ - API endpoint testing
           \- Database integration
            \
            Unit Tests (Many)
            - Component logic
            - Service functions
            - Utility functions
```

#### Coverage Goals
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: All API endpoints and database operations
- **E2E Tests**: Primary user flows and critical features
- **Component Tests**: All user-facing components

### 📱 Frontend Testing Implementation

#### Component Unit Tests
```typescript
// Example: WillCounterButton.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { WillCounterButton } from '../WillCounterButton';
import { willCounterSlice } from '../../store/slices/willCounterSlice';

describe('WillCounterButton', () => {
  const mockStore = configureStore({
    reducer: {
      willCounter: willCounterSlice.reducer,
    },
    preloadedState: {
      willCounter: {
        todayCount: 0,
        loading: false,
        error: null,
      },
    },
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  it('should render with correct initial state', () => {
    const { getByText, getByTestId } = renderWithProvider(
      <WillCounterButton onIncrement={jest.fn()} />
    );

    expect(getByText('0')).toBeTruthy();
    expect(getByTestId('will-counter-button')).toBeTruthy();
  });

  it('should call onIncrement when pressed', async () => {
    const mockOnIncrement = jest.fn();
    const { getByTestId } = renderWithProvider(
      <WillCounterButton onIncrement={mockOnIncrement} />
    );

    fireEvent.press(getByTestId('will-counter-button'));
    
    await waitFor(() => {
      expect(mockOnIncrement).toHaveBeenCalledTimes(1);
    });
  });

  it('should show loading state correctly', () => {
    const storeWithLoading = configureStore({
      reducer: { willCounter: willCounterSlice.reducer },
      preloadedState: {
        willCounter: { todayCount: 0, loading: true, error: null },
      },
    });

    const { getByTestId } = render(
      <Provider store={storeWithLoading}>
        <WillCounterButton onIncrement={jest.fn()} />
      </Provider>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should handle error states gracefully', () => {
    const storeWithError = configureStore({
      reducer: { willCounter: willCounterSlice.reducer },
      preloadedState: {
        willCounter: { 
          todayCount: 0, 
          loading: false, 
          error: 'Network error' 
        },
      },
    });

    const { getByText } = render(
      <Provider store={storeWithError}>
        <WillCounterButton onIncrement={jest.fn()} />
      </Provider>
    );

    expect(getByText('Error occurred')).toBeTruthy();
  });
});
```

#### Redux Slice Testing
```typescript
// Example: willCounterSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { willCounterSlice, incrementCount, fetchTodayCount } from '../willCounterSlice';

describe('willCounterSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        willCounter: willCounterSlice.reducer,
      },
    });
  });

  describe('synchronous actions', () => {
    it('should handle initial state', () => {
      const state = willCounterSlice.reducer(undefined, { type: 'unknown' });
      expect(state).toEqual({
        todayCount: 0,
        loading: false,
        error: null,
        lastUpdated: null,
      });
    });

    it('should handle reset count', () => {
      const previousState = { todayCount: 5, loading: false, error: null, lastUpdated: null };
      const state = willCounterSlice.reducer(previousState, willCounterSlice.actions.resetCount());
      expect(state.todayCount).toBe(0);
    });
  });

  describe('async actions', () => {
    it('should handle incrementCount.pending', () => {
      const action = { type: incrementCount.pending.type };
      const state = willCounterSlice.reducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle incrementCount.fulfilled', () => {
      const action = {
        type: incrementCount.fulfilled.type,
        payload: { count: 1, id: '1', user_id: 'user1', date: '2024-01-01' },
      };
      const state = willCounterSlice.reducer(undefined, action);
      expect(state.loading).toBe(false);
      expect(state.todayCount).toBe(1);
      expect(state.error).toBe(null);
    });

    it('should handle incrementCount.rejected', () => {
      const action = {
        type: incrementCount.rejected.type,
        payload: 'Network error',
      };
      const state = willCounterSlice.reducer(undefined, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });
});
```

#### API Integration Tests
```typescript
// Example: apiService.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { apiService } from '../apiService';

const server = setupServer(
  rest.post('http://localhost:8080/api/will-counts/increment', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: { id: '1', count: 1, user_id: 'user1', date: '2024-01-01' }
    }));
  }),

  rest.get('http://localhost:8080/api/will-counts/:userId/today', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: { id: '1', count: 5, user_id: req.params.userId, date: '2024-01-01' }
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('apiService', () => {
  describe('incrementCount', () => {
    it('should increment count successfully', async () => {
      const result = await apiService.incrementCount('user1');
      expect(result).toEqual({
        id: '1',
        count: 1,
        user_id: 'user1',
        date: '2024-01-01'
      });
    });

    it('should handle API errors', async () => {
      server.use(
        rest.post('http://localhost:8080/api/will-counts/increment', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            success: false,
            error: 'Internal server error'
          }));
        })
      );

      await expect(apiService.incrementCount('user1')).rejects.toThrow('Internal server error');
    });
  });

  describe('getTodayCount', () => {
    it('should fetch today count successfully', async () => {
      const result = await apiService.getTodayCount('user1');
      expect(result.count).toBe(5);
      expect(result.user_id).toBe('user1');
    });
  });
});
```

### ⚙️ Backend Testing Implementation

#### Kotlin Service Tests
```kotlin
// Example: WillCountServiceTest.kt
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import com.willcounter.api.services.WillCountService
import com.willcounter.api.models.WillCount
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction

class WillCountServiceTest : StringSpec({
    
    val service = WillCountService()
    
    "should create today count for new user" {
        transaction {
            val result = service.getOrCreateTodayCount("user1")
            
            result shouldNotBe null
            result.userId shouldBe "user1"
            result.count shouldBe 0
            result.date shouldBe LocalDate.now().toString()
        }
    }
    
    "should increment existing count" {
        transaction {
            // Setup: Create initial count
            val initial = service.getOrCreateTodayCount("user1")
            
            // Action: Increment count
            val incremented = service.incrementCount("user1")
            
            // Verify: Count increased
            incremented.count shouldBe initial.count + 1
            incremented.id shouldBe initial.id
        }
    }
    
    "should handle user statistics calculation" {
        transaction {
            // Setup: Create test data
            repeat(5) {
                service.incrementCount("user1")
            }
            
            // Action: Get statistics
            val stats = service.getUserStatistics("user1", 30)
            
            // Verify: Statistics are correct
            stats.totalCount shouldBe 5
            stats.averagePerDay shouldBe 5.0 / 30
        }
    }
    
    "should isolate user data" {
        transaction {
            // Setup: Create data for different users
            service.incrementCount("user1")
            service.incrementCount("user2")
            
            // Action: Get user1 data
            val user1Stats = service.getUserStatistics("user1", 30)
            val user2Stats = service.getUserStatistics("user2", 30)
            
            // Verify: Data is isolated
            user1Stats.totalCount shouldBe 1
            user2Stats.totalCount shouldBe 1
        }
    }
})
```

#### API Endpoint Tests
```kotlin
// Example: WillCountRoutesTest.kt
import io.kotest.core.spec.style.StringSpec
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.Json
import com.willcounter.api.models.ApiResponse
import com.willcounter.api.module

class WillCountRoutesTest : StringSpec({
    
    "GET /api/will-counts/user1/today should return today count" {
        testApplication {
            application {
                module()
            }
            
            val response = client.get("/api/will-counts/user1/today") {
                header(HttpHeaders.Authorization, "Bearer valid-jwt-token")
            }
            
            response.status shouldBe HttpStatusCode.OK
            
            val apiResponse = Json.decodeFromString<ApiResponse<WillCount>>(response.bodyAsText())
            apiResponse.success shouldBe true
            apiResponse.data shouldNotBe null
        }
    }
    
    "POST /api/will-counts/increment should increment count" {
        testApplication {
            application {
                module()
            }
            
            val response = client.post("/api/will-counts/increment") {
                header(HttpHeaders.Authorization, "Bearer valid-jwt-token")
                header(HttpHeaders.ContentType, ContentType.Application.Json.toString())
                setBody("""{"userId": "user1"}""")
            }
            
            response.status shouldBe HttpStatusCode.OK
            
            val apiResponse = Json.decodeFromString<ApiResponse<WillCount>>(response.bodyAsText())
            apiResponse.success shouldBe true
            apiResponse.data?.count shouldBe 1
        }
    }
    
    "POST /api/will-counts/increment should require authentication" {
        testApplication {
            application {
                module()
            }
            
            val response = client.post("/api/will-counts/increment") {
                header(HttpHeaders.ContentType, ContentType.Application.Json.toString())
                setBody("""{"userId": "user1"}""")
            }
            
            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }
})
```

### 🔗 E2E Testing Implementation

#### Detox E2E Tests
```javascript
// Example: willCounter.e2e.js
describe('Will Counter Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display will counter screen', async () => {
    await expect(element(by.id('will-counter-screen'))).toBeVisible();
    await expect(element(by.id('counter-display'))).toBeVisible();
    await expect(element(by.id('increment-button'))).toBeVisible();
  });

  it('should increment counter when button is pressed', async () => {
    // Initial state
    await expect(element(by.text('0'))).toBeVisible();
    
    // Tap increment button
    await element(by.id('increment-button')).tap();
    
    // Verify count increased
    await expect(element(by.text('1'))).toBeVisible();
  });

  it('should show loading state during increment', async () => {
    // Tap increment button
    await element(by.id('increment-button')).tap();
    
    // Verify loading indicator appears briefly
    await expect(element(by.id('loading-indicator'))).toBeVisible();
    
    // Wait for completion
    await waitFor(element(by.id('loading-indicator')))
      .not.toBeVisible()
      .withTimeout(5000);
  });

  it('should persist count across app restarts', async () => {
    // Increment counter
    await element(by.id('increment-button')).tap();
    await expect(element(by.text('1'))).toBeVisible();
    
    // Restart app
    await device.terminateApp();
    await device.launchApp();
    
    // Verify count persisted
    await expect(element(by.text('1'))).toBeVisible();
  });

  it('should handle offline mode gracefully', async () => {
    // Disable network
    await device.setNetworkConditions({
      online: false
    });
    
    // Try to increment
    await element(by.id('increment-button')).tap();
    
    // Should show offline indicator but still increment locally
    await expect(element(by.id('offline-indicator'))).toBeVisible();
    await expect(element(by.text('1'))).toBeVisible();
    
    // Re-enable network
    await device.setNetworkConditions({
      online: true
    });
    
    // Should sync and hide offline indicator
    await waitFor(element(by.id('offline-indicator')))
      .not.toBeVisible()
      .withTimeout(10000);
  });
});
```

### 🚀 Performance Testing

#### Load Testing Script
```javascript
// Example: loadTest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
};

const BASE_URL = 'http://localhost:8080';
const AUTH_TOKEN = 'Bearer test-jwt-token';

export default function () {
  // Test increment endpoint
  let incrementResponse = http.post(
    `${BASE_URL}/api/will-counts/increment`,
    JSON.stringify({ userId: `user-${__VU}` }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
    }
  );

  check(incrementResponse, {
    'increment status is 200': (r) => r.status === 200,
    'increment response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test get today count endpoint
  let getTodayResponse = http.get(
    `${BASE_URL}/api/will-counts/user-${__VU}/today`,
    {
      headers: {
        'Authorization': AUTH_TOKEN,
      },
    }
  );

  check(getTodayResponse, {
    'get today status is 200': (r) => r.status === 200,
    'get today response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

### 📊 Test Coverage and Reporting

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

### 🛡️ Security Testing

#### Authentication Tests
```typescript
// Example: auth.security.test.ts
describe('Authentication Security', () => {
  it('should reject requests without valid JWT', async () => {
    const response = await request(app)
      .post('/api/will-counts/increment')
      .send({ userId: 'user1' });
    
    expect(response.status).toBe(401);
  });

  it('should reject expired JWT tokens', async () => {
    const expiredToken = 'Bearer expired-jwt-token';
    const response = await request(app)
      .post('/api/will-counts/increment')
      .set('Authorization', expiredToken)
      .send({ userId: 'user1' });
    
    expect(response.status).toBe(401);
  });

  it('should prevent cross-user data access', async () => {
    const user1Token = 'Bearer user1-jwt-token';
    const response = await request(app)
      .get('/api/will-counts/user2/today')
      .set('Authorization', user1Token);
    
    expect(response.status).toBe(403);
  });
});
```

---

**CONSTRAINTS**:
- Tests must run reliably in CI/CD environment
- Should cover both happy path and error scenarios
- Must validate security and authorization
- Should include performance benchmarks
- Must work on both iOS and Android platforms

## 🔄 Testing Automation

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test -- --coverage
      - run: cd frontend && npm run lint

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - run: cd api && ./gradlew test

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npx detox build --configuration ios
      - run: cd frontend && npx detox test --configuration ios
```

## 📚 Related Documentation

- [Testing Best Practices](/docs/testing-guide.md) [if exists]
- [CI/CD Setup](/docs/deployment.md) [if exists]
- [Code Quality Standards](/docs/code-quality.md) [if exists]
- [Performance Benchmarks](/docs/performance.md) [if exists]

## 💡 Testing Best Practices

1. **Write Tests First**: TDD approach for critical functionality
2. **Test Behavior**: Focus on what the code should do, not how
3. **Keep Tests Simple**: One assertion per test when possible
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Error conditions and boundary values
6. **Maintain Test Data**: Use factories for consistent test data