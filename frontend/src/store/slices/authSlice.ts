import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { setLoading, setUser, clearError, logout } = authSlice.actions;

// Async thunk for login
export const login = () => async (dispatch: any) => {
  dispatch(setLoading(true));
  try {
    // Mock login - in real app this would use Auth0
    dispatch(setUser({
      id: '1',
      email: 'user@example.com'
    }));
  } catch (error) {
    console.error('Login failed:', error);
    dispatch(setUser(null));
  } finally {
    dispatch(setLoading(false));
  }
};

// Async thunk for checking auth state
export const checkAuthState = () => async (dispatch: any) => {
  dispatch(setLoading(true));
  try {
    // For now, we'll just set a mock authenticated state
    dispatch(setUser({
      id: '1',
      email: 'user@example.com'
    }));
  } catch (error) {
    console.error('Auth check failed:', error);
    dispatch(setUser(null));
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;