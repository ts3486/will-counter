import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { checkAuthState } from '../store/slices/authSlice';
import { createUserProfile, fetchUserPreferences } from '../store/slices/userSlice';

import LoginScreen from '../components/auth/LoginScreen';
import WillCounterScreen from '../components/counter/WillCounterScreen';
import StatisticsScreen from '../components/statistics/StatisticsScreen';
import SettingsScreen from '../components/settings/SettingsScreen';
import LoadingScreen from '../components/shared/LoadingScreen';

export type RootStackParamList = {
  Login: undefined;
  WillCounter: undefined;
  Statistics: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create or update user profile
      dispatch(createUserProfile({
        auth0Id: user.id,
        email: user.email,
      }));

      // Fetch user preferences
      dispatch(fetchUserPreferences(user.id));
    }
  }, [isAuthenticated, user, dispatch]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="WillCounter" component={WillCounterScreen} />
            <Stack.Screen name="Statistics" component={StatisticsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;