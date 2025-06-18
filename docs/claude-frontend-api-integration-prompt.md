# Claude Prompt: Replace Mock Data with Real API Integration

## Context
You are helping me replace mock data and local storage in a React Native/Expo frontend with actual API calls to a Kotlin/Ktor backend that's connected to Supabase PostgreSQL database.

## Current State
- **Frontend**: React Native/Expo app using Redux Toolkit
- **Backend**: Kotlin/Ktor API with Supabase PostgreSQL
- **Current Frontend**: Uses mock data and AsyncStorage for persistence
- **Target**: Real API integration with Supabase database

## Files to Modify

### 1. Redux Slice - `frontend/src/store/slices/willCounterSlice.ts`
**Current**: Uses mock API calls and local state
**Target**: Real API calls to backend endpoints

### 2. Counter Screen - `frontend/src/components/counter/WillCounterScreen.tsx`
**Current**: Uses AsyncStorage and local state
**Target**: Uses Redux actions that call real API

### 3. User Slice - `frontend/src/store/slices/userSlice.ts`
**Current**: Likely uses mock data
**Target**: Real API calls for user operations

## Required Changes

### 1. Update WillCounterSlice.ts

**Replace mock API calls with real HTTP requests:**

```typescript
// Current mock implementation
export const incrementCount = createAsyncThunk(
  'willCounter/incrementCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Mock API call - in real app this would increment in Supabase
      const mockUpdatedCount: WillCount = {
        id: '1',
        user_id: userId,
        count: 1,
        date: new Date().toISOString().split('T')[0],
        timestamps: [new Date().toISOString()],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return mockUpdatedCount;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to increment count');
    }
  }
);
```

**Replace with real API calls:**

```typescript
// Real API implementation
export const incrementCount = createAsyncThunk(
  'willCounter/incrementCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/api/will-counts/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to increment count');
      }

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to increment count');
    }
  }
);
```

### 2. Update WillCounterScreen.tsx

**Replace AsyncStorage with Redux actions:**

```typescript
// Current: Uses AsyncStorage and local state
const [count, setCount] = useState<number>(0);
const [history, setHistory] = useState<CounterHistoryItem[]>([]);

// Load persisted data on component mount
useEffect(() => {
  loadPersistedData();
}, []);

// Persist data whenever state changes
useEffect(() => {
  if (!isLoading) {
    persistData();
  }
}, [count, history, streak, isLoading]);
```

**Replace with Redux integration:**

```typescript
// New: Uses Redux and API calls
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTodayCount, 
  incrementCount, 
  selectTodayCount, 
  selectIsLoading, 
  selectError 
} from '../../store/slices/willCounterSlice';

const WillCounterScreen: React.FC = () => {
  const dispatch = useDispatch();
  const count = useSelector(selectTodayCount);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // Load today's count on component mount
  useEffect(() => {
    const userId = 'current-user-id'; // Get from auth context
    dispatch(fetchTodayCount(userId));
  }, [dispatch]);

  // Handle increment
  const handleIncrement = useCallback((): void => {
    const userId = 'current-user-id'; // Get from auth context
    dispatch(incrementCount(userId));
  }, [dispatch]);
};
```

### 3. Create API Service Layer

**Create `frontend/src/services/api.ts`:**

```typescript
const API_BASE_URL = 'http://localhost:8080';

export const apiService = {
  // Will Count operations
  async getTodayCount(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/will-counts/${userId}/today`);
    if (!response.ok) throw new Error('Failed to fetch today count');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async incrementCount(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/will-counts/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to increment count');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async getUserStatistics(userId: string, days: number = 30) {
    const response = await fetch(`${API_BASE_URL}/api/will-counts/${userId}/statistics?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  // User operations
  async createUser(auth0Id: string, email: string) {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth0_id: auth0Id, email }),
    });
    if (!response.ok) throw new Error('Failed to create user');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async getUserByAuth0Id(auth0Id: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${auth0Id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async updateLastLogin(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/login`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to update last login');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
};
```

### 4. Update Redux Slices to Use API Service

**Update willCounterSlice.ts:**

```typescript
import { apiService } from '../../services/api';

export const fetchTodayCount = createAsyncThunk(
  'willCounter/fetchTodayCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.getTodayCount(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch today count');
    }
  }
);

export const incrementCount = createAsyncThunk(
  'willCounter/incrementCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.incrementCount(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to increment count');
    }
  }
);
```

### 5. Handle Offline/Online State

**Add network detection and offline sync:**

```typescript
// In willCounterSlice.ts
export const syncOfflineIncrements = createAsyncThunk(
  'willCounter/syncOfflineIncrements',
  async (params: { userId: string; increments: number }, { rejectWithValue }) => {
    try {
      // Sync multiple increments
      let currentCount = 0;
      for (let i = 0; i < params.increments; i++) {
        const result = await apiService.incrementCount(params.userId);
        currentCount = result.count;
      }
      return { count: currentCount };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync offline increments');
    }
  }
);
```

### 6. Update User Authentication Flow

**Create user context and auth integration:**

```typescript
// frontend/src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UserContextType {
  user: any | null;
  userId: string | null;
  login: (auth0Id: string, email: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const login = async (auth0Id: string, email: string) => {
    try {
      // Try to get existing user
      let userData = await apiService.getUserByAuth0Id(auth0Id);
      setUser(userData);
      setUserId(userData.id);
    } catch (error) {
      // Create new user if doesn't exist
      const newUser = await apiService.createUser(auth0Id, email);
      setUser(newUser);
      setUserId(newUser.id);
    }
  };

  const logout = () => {
    setUser(null);
    setUserId(null);
  };

  return (
    <UserContext.Provider value={{ user, userId, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

## Implementation Steps

1. **Create API service layer** with all HTTP calls
2. **Update Redux slices** to use real API calls instead of mocks
3. **Replace AsyncStorage** with Redux state management
4. **Add user authentication context** for user management
5. **Update components** to use Redux selectors and actions
6. **Add error handling** and loading states
7. **Implement offline sync** for better UX

## Expected Outcome

After implementation:
- ✅ Frontend calls real API endpoints
- ✅ Data persists in Supabase database
- ✅ Real-time updates across app restarts
- ✅ Proper error handling and loading states
- ✅ Offline capability with sync when online
- ✅ User authentication integration

## Testing

Test each action:
1. **Increment count** → Check Supabase `will_counts` table
2. **Create user** → Check Supabase `users` table
3. **Fetch statistics** → Verify data from database
4. **Offline/online sync** → Test network disconnection

Please implement these changes step by step, ensuring each modification works before proceeding to the next. 