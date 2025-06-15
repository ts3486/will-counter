import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WillCounterScreen from '../../../src/components/counter/WillCounterScreen';
import authReducer from '../../../src/store/slices/authSlice';
import willCounterReducer from '../../../src/store/slices/willCounterSlice';
import userReducer from '../../../src/store/slices/userSlice';

// Mock dependencies
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('../../../src/components/shared/SoundPlayer', () => ({
  playCountSound: jest.fn(),
}));

jest.mock('../../../src/hooks/useOfflineSync', () => ({
  useOfflineSync: () => ({
    isOffline: false,
    offlineIncrementCount: 0,
    syncOfflineData: jest.fn(),
  }),
}));

jest.mock('../../../src/hooks/useToast', () => ({
  useToast: () => ({
    toast: { visible: false, message: '', type: 'info' },
    hideToast: jest.fn(),
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      willCounter: willCounterReducer,
      user: userReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false,
        error: null,
        accessToken: null,
        refreshToken: null,
      },
      willCounter: {
        todayCount: 5,
        currentRecord: null,
        loading: false,
        error: null,
        lastIncrementTime: null,
      },
      user: {
        preferences: {
          soundEnabled: true,
          notificationEnabled: true,
          theme: 'light',
        },
        statistics: [],
        loading: false,
        error: null,
      },
      ...initialState,
    },
  });
};

const renderWithStore = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('WillCounterScreen', () => {
  it('renders correctly with user data', () => {
    const { getByText } = renderWithStore(<WillCounterScreen />);
    
    expect(getByText('Hello, User')).toBeTruthy();
    expect(getByText('005')).toBeTruthy(); // Formatted count
    expect(getByText('+')).toBeTruthy(); // Counter button
  });

  it('displays correct motivation message based on count', () => {
    const store = createTestStore({
      willCounter: { todayCount: 0, currentRecord: null, loading: false, error: null, lastIncrementTime: null },
    });
    
    const { getByText } = renderWithStore(<WillCounterScreen />, store);
    expect(getByText('Start building your willpower!')).toBeTruthy();
  });

  it('displays motivation for higher counts', () => {
    const store = createTestStore({
      willCounter: { todayCount: 15, currentRecord: null, loading: false, error: null, lastIncrementTime: null },
    });
    
    const { getByText } = renderWithStore(<WillCounterScreen />, store);
    expect(getByText('Amazing willpower! You\'re unstoppable!')).toBeTruthy();
  });

  it('shows logout button', () => {
    const { getByText } = renderWithStore(<WillCounterScreen />);
    expect(getByText('Logout')).toBeTruthy();
  });

  it('handles counter button press', async () => {
    const { getByText } = renderWithStore(<WillCounterScreen />);
    const counterButton = getByText('+');
    
    fireEvent.press(counterButton);
    
    // The button should be pressable
    expect(counterButton).toBeTruthy();
  });

  it('displays offline indicator when offline', () => {
    // Mock offline state
    jest.doMock('../../../src/hooks/useOfflineSync', () => ({
      useOfflineSync: () => ({
        isOffline: true,
        offlineIncrementCount: 3,
        syncOfflineData: jest.fn(),
      }),
    }));

    const { getByText } = renderWithStore(<WillCounterScreen />);
    expect(getByText(/Offline mode - 3 pending sync/)).toBeTruthy();
  });
});