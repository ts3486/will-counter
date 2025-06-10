import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Auth0 from '@react-native-auth0/auth0';
import { auth0Config } from '../../config/auth0';
import { setSupabaseAuth } from '../../config/supabase';

const auth0 = new Auth0(auth0Config);

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (_, { rejectWithValue }) => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: auth0Config.scope,
        audience: auth0Config.audience,
      });

      // Set the token for Supabase
      setSupabaseAuth(credentials.accessToken);

      return {
        user: {
          id: credentials.idToken ? JSON.parse(atob(credentials.idToken.split('.')[1])).sub : '',
          email: credentials.idToken ? JSON.parse(atob(credentials.idToken.split('.')[1])).email : '',
          name: credentials.idToken ? JSON.parse(atob(credentials.idToken.split('.')[1])).name : '',
          picture: credentials.idToken ? JSON.parse(atob(credentials.idToken.split('.')[1])).picture : '',
        },
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await auth0.webAuth.clearSession();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { rejectWithValue }) => {
    try {
      const credentials = await auth0.credentialsManager.getCredentials();
      
      if (credentials) {
        // Set the token for Supabase
        setSupabaseAuth(credentials.accessToken);

        return {
          user: {
            id: credentials.idToken ? JSON.parse(atob(credentials.idToken.split('.')[1])).sub : '',
            email: credentials.idToken ? JSON.parse(atob(credentials.idToken.split('.')[1])).email : '',
            name: credentials.idToken ? JSON.parse(atob(credentials.idToken.split('.')[1])).name : '',
            picture: credentials.idToken ? JSON.parse(atob(credentials.idToken.split('.')[1])).picture : '',
          },
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
        };
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check auth state
      .addCase(checkAuthState.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;