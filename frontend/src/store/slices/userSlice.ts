import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { supabase } from '../../config/supabase';

interface UserPreferences {
  dailyGoal: number;
  notifications: boolean;
  darkMode: boolean;
}

interface UserStatistics {
  date: string;
  count: number;
}

interface UserState {
  preferences: UserPreferences;
  statistics: UserStatistics[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  preferences: {
    dailyGoal: 10,
    notifications: true,
    darkMode: false,
  },
  statistics: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create user profile
      .addCase(createUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch preferences
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch statistics
      .addCase(fetchUserStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPreferences, setLoading, clearError } = userSlice.actions;

// Async thunks
export const createUserProfile = createAsyncThunk(
  'user/createUserProfile',
  async (userData: { auth0Id: string; email: string }, { rejectWithValue }) => {
    try {
      // Mock API call - in real app this would create a user profile
      console.log('Creating user profile:', userData);
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create user profile');
    }
  }
);

export const fetchUserPreferences = createAsyncThunk(
  'user/fetchUserPreferences',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Mock API call - in real app this would fetch user preferences
      const mockPreferences: UserPreferences = {
        dailyGoal: 10,
        notifications: true,
        darkMode: false,
      };
      return mockPreferences;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user preferences');
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updateUserPreferences',
  async (params: { auth0Id: string; preferences: UserPreferences }, { rejectWithValue }) => {
    try {
      // Mock API call - in real app this would update user preferences
      console.log('Updating user preferences:', params);
      return params.preferences;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update preferences');
    }
  }
);

export const fetchUserStatistics = createAsyncThunk(
  'user/fetchUserStatistics',
  async (params: { userId: string; days?: number }, { rejectWithValue }) => {
    try {
      // Mock API call - in real app this would fetch user statistics
      const mockStatistics: UserStatistics[] = [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 8 },
        { date: '2024-01-03', count: 3 },
      ];
      return mockStatistics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

export default userSlice.reducer;