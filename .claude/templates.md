# Claude Code Templates - Will Counter

## React Component Templates

### Basic Functional Component
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentNameProps {
  title: string;
  onPress?: () => void;
}

const ComponentName: React.FC<ComponentNameProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ComponentName;
```

### Component with Redux
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { actionName } from '../../store/slices/sliceName';

const ComponentName: React.FC = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.sliceName.data);
  
  const handleAction = () => {
    dispatch(actionName(payload));
  };

  return (
    <View style={styles.container}>
      <Text>{data}</Text>
      <TouchableOpacity onPress={handleAction} style={styles.button}>
        <Text style={styles.buttonText}>Action</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ComponentName;
```

### Component with Auth Context
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const ComponentName: React.FC = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome, {user?.name}</Text>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ComponentName;
```

## Redux Templates

### Redux Slice
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface ItemState {
  data: Item[];
  loading: boolean;
  error: string | null;
}

interface Item {
  id: string;
  name: string;
  // Add other properties
}

const initialState: ItemState = {
  data: [],
  loading: false,
  error: null,
};

// Async thunk
export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async (params: FetchParams, { rejectWithValue }) => {
    try {
      const response = await apiService.getItems(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Item>) => {
      state.data.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<Item>) => {
      const index = state.data.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(item => item.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addItem, updateItem, removeItem, clearError } = itemSlice.actions;

// Selectors
export const selectItems = (state: RootState) => state.items.data;
export const selectItemsLoading = (state: RootState) => state.items.loading;
export const selectItemsError = (state: RootState) => state.items.error;

export default itemSlice.reducer;
```

## API Service Templates

### API Service with Error Handling
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiService {
  private baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
```

### Supabase Service Template
```typescript
interface SupabaseService {
  async getData<T>(table: string, filters?: Record<string, any>): Promise<T[]> {
    try {
      let url = `${SUPABASE_URL}/rest/v1/${table}`;
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, `eq.${value}`);
        });
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: getSupabaseHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase getData error:', error);
      throw error;
    }
  }

  async createData<T>(table: string, data: Partial<T>): Promise<T> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...getSupabaseHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.statusText}`);
      }

      const result = await response.json();
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Supabase createData error:', error);
      throw error;
    }
  }
}
```

## Test Templates

### Component Test Template
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ComponentName from '../ComponentName';

// Mock dependencies
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User' },
    logout: jest.fn(),
    loading: false,
  }),
}));

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      // Add your reducers here
    },
    preloadedState: initialState,
  });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({ 
  children, 
  store = createTestStore() 
}) => (
  <Provider store={store}>
    {children}
  </Provider>
);

describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => {
      render(
        <TestWrapper>
          <ComponentName />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should display expected content', () => {
    const { getByText } = render(
      <TestWrapper>
        <ComponentName />
      </TestWrapper>
    );

    expect(getByText('Expected Text')).toBeTruthy();
  });

  it('should handle user interactions', () => {
    const mockFunction = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <ComponentName onPress={mockFunction} />
      </TestWrapper>
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});
```

### Redux Test Template
```typescript
import { configureStore } from '@reduxjs/toolkit';
import sliceReducer, { actionName, selectData } from '../sliceName';

describe('sliceName slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        sliceName: sliceReducer,
      },
    });
  });

  it('should handle initial state', () => {
    const state = store.getState().sliceName;
    expect(state).toEqual({
      data: [],
      loading: false,
      error: null,
    });
  });

  it('should handle actionName', () => {
    const testData = { id: '1', name: 'Test' };
    store.dispatch(actionName(testData));

    const state = store.getState().sliceName;
    expect(state.data).toContain(testData);
  });

  it('should select data correctly', () => {
    const testData = [{ id: '1', name: 'Test' }];
    store.dispatch(actionName(testData[0]));

    const selectedData = selectData(store.getState());
    expect(selectedData).toEqual(testData);
  });
});
```

## Kotlin Backend Templates

### Ktor Route Template
```kotlin
fun Route.itemRoutes() {
    authenticate("auth0") {
        route("/api/items") {
            get {
                try {
                    val userId = call.principal<UserPrincipal>()?.userId
                        ?: return@get call.respond(HttpStatusCode.Unauthorized)
                    
                    val items = ItemService.getItemsByUserId(userId)
                    call.respond(HttpStatusCode.OK, items)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.message))
                }
            }
            
            post {
                try {
                    val userId = call.principal<UserPrincipal>()?.userId
                        ?: return@post call.respond(HttpStatusCode.Unauthorized)
                    
                    val request = call.receive<CreateItemRequest>()
                    val item = ItemService.createItem(userId, request)
                    call.respond(HttpStatusCode.Created, item)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.message))
                }
            }
        }
    }
}
```

### Data Model Template
```kotlin
@Serializable
data class Item(
    val id: String,
    val userId: String,
    val name: String,
    val description: String? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class CreateItemRequest(
    val name: String,
    val description: String? = null
)

@Serializable
data class UpdateItemRequest(
    val name: String? = null,
    val description: String? = null
)
```

## Quick Command Templates

### Development Setup
```bash
# Fresh start
rm -rf node_modules frontend/node_modules
npm install && cd frontend && npm install && cd ..

# Start development
# Terminal 1:
cd frontend && npm start

# Terminal 2:
cd api && export $(cat ../.env | xargs) && ./gradlew run

# Test everything
cd frontend && npm test && npm run lint && cd ../api && ./gradlew test
```

### Debugging Commands
```bash
# Clear all caches
npx expo start --clear
./gradlew clean

# Reset Metro bundler
npx expo start --reset-cache

# Check for issues
npx expo doctor
npm audit

# View logs
npx expo logs
./gradlew run --info
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/feature-name
git add .
git commit -m "feat: add feature description"
git push origin feature/feature-name

# Create PR and merge
gh pr create --title "Feature: Description" --body "Details"
```

These templates provide starting points for common development tasks in the Will Counter project, following established patterns and best practices.