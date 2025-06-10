import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';
import { WillCount } from '../../../../shared/types/database';
import { RootState } from '../store';

interface WillCounterState {
  todayCount: number;
  currentRecord: WillCount | null;
  loading: boolean;
  error: string | null;
  lastIncrementTime: string | null;
}

const initialState: WillCounterState = {
  todayCount: 0,
  currentRecord: null,
  loading: false,
  error: null,
  lastIncrementTime: null,
};

export const fetchTodayCount = createAsyncThunk(
  'willCounter/fetchTodayCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_today_count', { p_user_id: userId });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch today count');
    }
  }
);

export const incrementCount = createAsyncThunk(
  'willCounter/incrementCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .rpc('increment_will_count', { p_user_id: userId });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to increment count');
    }
  }
);

export const syncOfflineIncrements = createAsyncThunk(
  'willCounter/syncOfflineIncrements',
  async (params: { userId: string; increments: number }, { rejectWithValue }) => {
    try {
      const { userId, increments } = params;
      
      // Get current record
      const { data: currentData, error: fetchError } = await supabase
        .rpc('get_or_create_today_count', { p_user_id: userId });

      if (fetchError) throw fetchError;

      // Update with offline increments
      const newCount = currentData.count + increments;
      const newTimestamps = [
        ...currentData.timestamps,
        ...Array(increments).fill(new Date().toISOString())
      ];

      const { data, error } = await supabase
        .from('will_counts')
        .update({
          count: newCount,
          timestamps: newTimestamps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync offline increments');
    }
  }
);

const willCounterSlice = createSlice({
  name: 'willCounter',
  initialState,
  reducers: {
    incrementOfflineCount: (state) => {
      state.todayCount += 1;
      state.lastIncrementTime = new Date().toISOString();
    },
    resetOfflineCount: (state) => {
      // Reset offline increments after successful sync
      state.lastIncrementTime = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch today count
      .addCase(fetchTodayCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayCount.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
        state.todayCount = action.payload.count;
      })
      .addCase(fetchTodayCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Increment count
      .addCase(incrementCount.pending, (state) => {
        state.error = null;
      })
      .addCase(incrementCount.fulfilled, (state, action) => {
        state.currentRecord = action.payload;
        state.todayCount = action.payload.count;
        state.lastIncrementTime = new Date().toISOString();
      })
      .addCase(incrementCount.rejected, (state, action) => {
        state.error = action.payload as string;
        // On network error, increment offline
        state.todayCount += 1;
        state.lastIncrementTime = new Date().toISOString();
      })
      // Sync offline increments
      .addCase(syncOfflineIncrements.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncOfflineIncrements.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
        state.todayCount = action.payload.count;
        state.lastIncrementTime = null;
      })
      .addCase(syncOfflineIncrements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { incrementOfflineCount, resetOfflineCount, clearError } = willCounterSlice.actions;

// Selectors
export const selectTodayCount = (state: RootState) => state.willCounter.todayCount;
export const selectIsLoading = (state: RootState) => state.willCounter.loading;
export const selectError = (state: RootState) => state.willCounter.error;
export const selectLastIncrementTime = (state: RootState) => state.willCounter.lastIncrementTime;

export default willCounterSlice.reducer;