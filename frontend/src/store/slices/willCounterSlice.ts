import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { improvedApiService } from '../../services/improvedApiService';
import { WillCount } from '../../../../shared/types/database';
import { RootState } from '../store';
import { ErrorHandler } from '../../utils/errorHandler';

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

// Initialize services on first use
let servicesInitialized = false;

const ensureServicesInitialized = async () => {
  if (!servicesInitialized) {
    await improvedApiService.initialize();
    servicesInitialized = true;
  }
};

export const fetchTodayCount = createAsyncThunk(
  'willCounter/fetchTodayCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      await ensureServicesInitialized();
      return await improvedApiService.getTodayCount(userId);
    } catch (error: any) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const incrementCount = createAsyncThunk(
  'willCounter/incrementCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      await ensureServicesInitialized();
      return await improvedApiService.incrementCount(userId);
    } catch (error: any) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetCount = createAsyncThunk(
  'willCounter/resetCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      await ensureServicesInitialized();
      return await improvedApiService.resetTodayCount(userId);
    } catch (error: any) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const syncOfflineIncrements = createAsyncThunk(
  'willCounter/syncOfflineIncrements',
  async (params: { userId: string; increments: number }, { rejectWithValue }) => {
    try {
      const { userId, increments } = params;
      
      // Mock API call - in real app this would sync with Supabase
      const mockSyncedCount: WillCount = {
        id: '1',
        user_id: userId,
        count: increments,
        date: new Date().toISOString().split('T')[0],
        timestamps: Array(increments).fill(new Date().toISOString()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return mockSyncedCount;
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
        console.log('Increment fulfilled, payload:', action.payload);
        state.currentRecord = action.payload;
        state.todayCount = action.payload?.count || state.todayCount + 1;
        state.lastIncrementTime = new Date().toISOString();
      })
      .addCase(incrementCount.rejected, (state, action) => {
        console.log('Increment rejected, error:', action.payload);
        state.error = action.payload as string;
        // On network error, increment offline
        state.todayCount += 1;
        state.lastIncrementTime = new Date().toISOString();
      })
      // Reset count
      .addCase(resetCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetCount.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
        state.todayCount = 0;
        state.lastIncrementTime = null;
      })
      .addCase(resetCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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