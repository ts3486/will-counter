import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import WillCounterScreen from '../components/counter/WillCounterScreen';
import StatisticsScreen from '../components/statistics/StatisticsScreen';
import SettingsScreen from '../components/settings/SettingsScreen';

export type TabParamList = {
  Counter: undefined;
  Statistics: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 84,
          elevation: 8,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.25,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Counter"
        component={WillCounterScreen}
        options={{
          tabBarLabel: 'Counter',
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: focused ? 20 : 16, color }}>
              🎯
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'Statistics',
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: focused ? 20 : 16, color }}>
              📊
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: focused ? 20 : 16, color }}>
              ⚙️
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;