# Quick Claude Prompt: Replace Mock Data with Real API

## Task
Replace mock data and AsyncStorage in React Native/Expo frontend with real API calls to Kotlin/Ktor backend connected to Supabase.

## Current State
- **Frontend**: Uses mock API calls in Redux slices
- **Backend**: Kotlin/Ktor API with Supabase PostgreSQL (working)
- **Storage**: AsyncStorage for local persistence
- **Target**: Real API integration with database persistence

## Files to Modify

### 1. Create API Service
**File**: `frontend/src/services/api.ts`

```typescript
const API_BASE_URL = 'http://localhost:8080';

export const apiService = {
  async getTodayCount(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/will-counts/${userId}/today`);
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
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async createUser(auth0Id: string, email: string) {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth0_id: auth0Id, email }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
};
```

### 2. Update WillCounterSlice.ts
**Replace mock calls with real API:**

```typescript
import { apiService } from '../../services/api';

export const fetchTodayCount = createAsyncThunk(
  'willCounter/fetchTodayCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.getTodayCount(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const incrementCount = createAsyncThunk(
  'willCounter/incrementCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await apiService.incrementCount(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

### 3. Update WillCounterScreen.tsx
**Replace AsyncStorage with Redux:**

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTodayCount, 
  incrementCount, 
  selectTodayCount, 
  selectIsLoading 
} from '../../store/slices/willCounterSlice';

const WillCounterScreen: React.FC = () => {
  const dispatch = useDispatch();
  const count = useSelector(selectTodayCount);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    const userId = 'test-user-123'; // Replace with real user ID
    dispatch(fetchTodayCount(userId));
  }, [dispatch]);

  const handleIncrement = useCallback(() => {
    const userId = 'test-user-123'; // Replace with real user ID
    dispatch(incrementCount(userId));
  }, [dispatch]);

  // Remove AsyncStorage code and use Redux state
};
```

### 4. Add User Context
**File**: `frontend/src/contexts/UserContext.tsx`

```typescript
import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../services/api';

interface UserContextType {
  userId: string | null;
  login: (auth0Id: string, email: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);

  const login = async (auth0Id: string, email: string) => {
    try {
      const user = await apiService.createUser(auth0Id, email);
      setUserId(user.id);
    } catch (error) {
      // Handle existing user case
      console.error('Login failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ userId, login }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
```

## Implementation Steps

1. **Create `api.ts`** service layer
2. **Update `willCounterSlice.ts`** to use real API calls
3. **Update `WillCounterScreen.tsx`** to use Redux instead of AsyncStorage
4. **Create `UserContext.tsx`** for user management
5. **Wrap app with UserProvider** in App.tsx
6. **Test increment action** and verify data in Supabase

## Expected Result
- ✅ Frontend calls real API endpoints
- ✅ Data persists in Supabase database
- ✅ Counter increments show in database
- ✅ No more mock data or AsyncStorage

## Test
1. Start API: `cd api && ./gradlew run`
2. Start Frontend: `cd frontend && npx expo start`
3. Increment counter in app
4. Check Supabase `will_counts` table for new data 