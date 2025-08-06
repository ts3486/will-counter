import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/shared/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <SafeAreaProvider>
            <ErrorBoundary isolate>
              <NavigationContainer>
                <StatusBar style="dark" backgroundColor="#f8f9fa" />
                <AppNavigator />
              </NavigationContainer>
            </ErrorBoundary>
          </SafeAreaProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}