import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ExceptionsManager should be set up after React DevTools',
]);

// Ensure proper error handling
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('ExceptionsManager')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

registerRootComponent(App);