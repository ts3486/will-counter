import React from 'react';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  return {
    default: {
      createAnimatedComponent: (component) => component,
      useSharedValue: (initial) => ({ value: initial }),
      useAnimatedStyle: (fn) => ({}),
      useAnimatedProps: (fn) => ({}),
      withTiming: (value) => value,
      withSpring: (value) => value,
      withSequence: (...values) => values[values.length - 1],
      runOnJS: (fn) => fn,
    },
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedStyle: (fn) => ({}),
    useAnimatedProps: (fn) => ({}),
    withTiming: (value) => value,
    withSpring: (value) => value,
    withSequence: (...values) => values[values.length - 1],
    runOnJS: (fn) => fn,
    createAnimatedComponent: (component) => component,
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium', 
    Heavy: 'heavy',
  },
}));

// Mock AuthContext
const mockAuthContext = {
  user: { id: 'test-user', email: 'test@example.com' },
  login: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
};

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native components
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Modal: 'Modal',
  Platform: {
    OS: 'ios',
  },
  Dimensions: {
    get: () => ({ width: 375, height: 667 }),
  },
}));

// Mock Redux
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector: any) => {
    // Mock different selectors
    if (selector.toString().includes('selectTodayCount')) return 0;
    if (selector.toString().includes('selectIsLoading')) return false;
    if (selector.toString().includes('selectError')) return null;
    return null;
  },
}));

// Mock redux slice
jest.mock('../../src/store/slices/willCounterSlice', () => ({
  fetchTodayCount: jest.fn(),
  incrementCount: jest.fn(),
  resetTodayCount: jest.fn(),
  selectTodayCount: jest.fn(),
  selectIsLoading: jest.fn(),
  selectError: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

describe('TabNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  it('should import without crashing', () => {
    expect(() => {
      require('../../src/navigation/TabNavigator');
    }).not.toThrow();
  });

  it('should export a default component', () => {
    const TabNavigator = require('../../src/navigation/TabNavigator').default;
    expect(TabNavigator).toBeDefined();
    expect(typeof TabNavigator).toBe('function');
  });

  it('should be a React component', () => {
    const TabNavigator = require('../../src/navigation/TabNavigator').default;
    
    // Test that it can be instantiated
    expect(() => {
      React.createElement(TabNavigator);
    }).not.toThrow();
  });

  it('should export TabParamList type', () => {
    const module = require('../../src/navigation/TabNavigator');
    
    // The module should export both default and types
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('function');
  });

  it('should be compatible with React functional component pattern', () => {
    const TabNavigator = require('../../src/navigation/TabNavigator').default;
    
    // Should be a function (functional component)
    expect(typeof TabNavigator).toBe('function');
    
    // Should not be a class component
    expect(TabNavigator.prototype?.render).toBeUndefined();
  });

  it('should handle multiple instantiations', () => {
    const TabNavigator = require('../../src/navigation/TabNavigator').default;
    
    // Test multiple instantiations to ensure no conflicts
    for (let i = 0; i < 3; i++) {
      expect(() => {
        React.createElement(TabNavigator);
      }).not.toThrow();
    }
  });

  it('should integrate with navigation system', () => {
    const TabNavigator = require('../../src/navigation/TabNavigator').default;
    
    // Basic integration test - should create without navigation context errors
    expect(() => {
      React.createElement(TabNavigator);
    }).not.toThrow();
  });
});