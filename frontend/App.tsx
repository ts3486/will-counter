import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './src/contexts/UserContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <UserProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#f8f9fa" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </UserProvider>
    </Provider>
  );
}