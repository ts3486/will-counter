import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import SoundPlayer from './src/components/shared/SoundPlayer';
import ErrorBoundary from './src/components/shared/ErrorBoundary';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize sound player
    SoundPlayer.initialize();

    return () => {
      // Cleanup sound player
      SoundPlayer.release();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <AppNavigator />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;