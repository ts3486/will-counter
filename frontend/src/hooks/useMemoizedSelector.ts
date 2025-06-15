import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../store/store';

// Memoized selector hook to prevent unnecessary re-renders
export const useMemoizedSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => {
  return useSelector(selector, shallowEqual);
};

// Specialized selectors for common use cases
export const useAuthSelector = () => {
  return useMemoizedSelector(state => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    loading: state.auth.loading,
  }));
};

export const useWillCounterSelector = () => {
  return useMemoizedSelector(state => ({
    todayCount: state.willCounter.todayCount,
    loading: state.willCounter.loading,
    error: state.willCounter.error,
    lastIncrementTime: state.willCounter.lastIncrementTime,
  }));
};

export const useUserPreferencesSelector = () => {
  return useMemoizedSelector(state => ({
    preferences: state.user.preferences,
    loading: state.user.loading,
  }));
};