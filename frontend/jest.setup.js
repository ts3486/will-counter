// Jest setup file for React Native with Expo
import 'react-native-gesture-handler/jestSetup';

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

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium', 
    Heavy: 'heavy',
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: ({ children }) => children,
  Circle: ({ children, ...props }) => ({ ...props, children }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useIsFocused: () => true,
    NavigationContainer: ({ children }) => children,
  };
});

// Mock React Navigation Bottom Tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test setup
global.__DEV__ = true;
