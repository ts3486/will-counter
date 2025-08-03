# Claude Code Context - Will Counter Project

## Current Development Context

### Active Development Areas
- **Authentication System**: Recently fixed logout popup issue, added success messaging
- **Testing Infrastructure**: Enhanced Jest configuration with comprehensive Expo mocks
- **CI/CD Pipeline**: Fixed GitHub Actions workflows for frontend tests and security scanning
- **Frontend Architecture**: React Native + Expo with TypeScript and Redux

### Recent Problem Solving
1. **Auth0 Logout Issue**: Removed `WebBrowser.openAuthSessionAsync()` call that was causing unwanted login popup after logout
2. **CI Test Failures**: Created `.eslintrc.js` configuration and added proper mocks for Expo modules
3. **Security Vulnerabilities**: Fixed npm audit issues with `npm audit fix`
4. **Cache Issues**: Fixed GitHub Actions cache dependency paths for npm

### Technical Stack Understanding
- **Frontend**: React Native 0.79 + Expo 53 + TypeScript + Redux Toolkit
- **Backend**: Kotlin + Ktor 2.3 + Gradle 8.13
- **Database**: Supabase (PostgreSQL) with REST API access
- **Authentication**: Auth0 OAuth with JWT tokens and secure storage
- **Testing**: Jest with React Test Renderer and comprehensive mocking

## Code Quality Standards

### Current Implementation Patterns
```typescript
// React Component Pattern
const ComponentName: React.FC = () => {
  const { functionFromContext } = useContext();
  const dispatch = useDispatch();
  const selectorValue = useSelector(selectSomething);
  
  const handleAction = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return <View>...</View>;
};

// Redux Slice Pattern
const sliceName = createSlice({
  name: 'sliceName',
  initialState,
  reducers: {
    actionName: (state, action) => {
      state.property = action.payload;
    },
  },
});

// API Service Pattern
export const apiService = {
  async getData(params: Parameters): Promise<ReturnType> {
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};
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
├── CLAUDE.md                 # Project memory (this file)
├── .claude/                  # Claude Code settings
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
- **ESLint**: Configured to ignore TypeScript files and use basic rules
- **Jest**: Comprehensive mocks for expo-auth-session, expo-web-browser, expo-secure-store
- **GitHub Actions**: Fixed cache paths and added security-events permissions
- **Auth0**: Working logout without popup, proper token management

### Development Best Practices Established
- **Error Handling**: Always wrap async operations in try/catch
- **Testing**: Mock all external dependencies (Expo, Auth0, Supabase)
- **Security**: Never commit actual environment variables
- **Code Organization**: Feature-based component organization
- **State Management**: Use Redux Toolkit with typed selectors

## Debugging Context

### Recently Solved Issues
1. **Logout Popup**: Caused by `WebBrowser.openAuthSessionAsync()` in logout function
2. **Test Failures**: Missing ESLint config and Expo module mocks
3. **CI Cache Issues**: Incorrect working-directory and cache-dependency-path combination
4. **Security Scan**: Missing permissions for GitHub Security tab upload

### Working Solutions
- **Auth Context**: Clean logout without browser popup, proper state clearing
- **Test Mocks**: Comprehensive mocking strategy for all Expo modules
- **CI Configuration**: Proper working-directory setup for GitHub Actions
- **Security**: Zero npm audit vulnerabilities

This context helps Claude Code understand the current state and successful patterns in the Will Counter project.