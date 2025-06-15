import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { checkAuthState } from '../store/slices/authSlice';
import { createUserProfile, fetchUserPreferences } from '../store/slices/userSlice';

import LoginScreen from '../components/auth/LoginScreen';
import TabNavigator from './TabNavigator';
import LoadingScreen from '../components/shared/LoadingScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;