import { configureStore } from '@reduxjs/toolkit';
import willCounterReducer, {
  incrementOfflineCount,
  resetOfflineCount,
  clearError,
} from '../../src/store/slices/willCounterSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      willCounter: willCounterReducer,
    },
  });

describe('willCounterSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should handle initial state', () => {
    const state = store.getState().willCounter;
    expect(state.todayCount).toBe(0);
    expect(state.currentRecord).toBe(null);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.lastIncrementTime).toBe(null);
  });

  it('should handle incrementOfflineCount', () => {
    store.dispatch(incrementOfflineCount());
    const state = store.getState().willCounter;
    expect(state.todayCount).toBe(1);
    expect(state.lastIncrementTime).toBeTruthy();
  });

  it('should handle resetOfflineCount', () => {
    store.dispatch(incrementOfflineCount());
    store.dispatch(resetOfflineCount());
    const state = store.getState().willCounter;
    expect(state.lastIncrementTime).toBe(null);
  });

  it('should handle clearError', () => {
    // Set an error state first
    const stateWithError = {
      ...store.getState().willCounter,
      error: 'Test error',
    };
    
    store.dispatch(clearError());
    const state = store.getState().willCounter;
    expect(state.error).toBe(null);
  });
});