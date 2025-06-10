import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';
import { UserPreferences, UserStatistics } from '../../../../shared/types/database';

interface UserState {
  preferences: UserPreferences;
  statistics: UserStatistics[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  preferences: {
    soundEnabled: true,
    notificationEnabled: true,
    theme: 'light',
  },
  statistics: [],
  loading: false,
  error: null,
};

export const createUserProfile = createAsyncThunk(
  'user/createUserProfile',
  async (params: { auth0Id: string; email: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          auth0_id: params.auth0Id,
          email: params.email,
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create user profile');
    }
  }
);

export const fetchUserPreferences = createAsyncThunk(
  'user/fetchUserPreferences',
  async (auth0Id: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('auth0_id', auth0Id)
        .single();

      if (error) throw error;
      return data.preferences as UserPreferences;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch preferences');
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updateUserPreferences',
  async (params: { auth0Id: string; preferences: UserPreferences }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ preferences: params.preferences })
        .eq('auth0_id', params.auth0Id)
        .select('preferences')
        .single();

      if (error) throw error;
      return data.preferences as UserPreferences;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update preferences');
    }
  }
);

export const fetchUserStatistics = createAsyncThunk(
  'user/fetchUserStatistics',
  async (params: { userId: string; days?: number }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_statistics', {
          p_user_id: params.userId,
          p_days: params.days || 30,
        });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updatePreference: (state, action) => {
      const { key, value } = action.payload;
      state.preferences = {
        ...state.preferences,
        [key]: value,
      };
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

export const { updatePreference, clearError } = userSlice.actions;
export default userSlice.reducer;