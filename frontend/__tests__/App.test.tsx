import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock dependencies
jest.mock('@react-native-auth0/auth0', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: {
      onAuthStateChange: jest.fn(),
      getUser: jest.fn(),
    },
    functions: {
      setAuth: jest.fn(),
    },
    rpc: jest.fn(),
  })),
}));

jest.mock('react-native-sound', () => ({
  setCategory: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});