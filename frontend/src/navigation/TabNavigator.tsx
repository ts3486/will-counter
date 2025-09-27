import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';
import { getResponsiveFontSize } from '../utils/responsive';

import WillCounterScreen from '../components/counter/WillCounterScreen';
// import StatisticsScreen from '../components/statistics/StatisticsScreen'; // Removed Statistics page
import SettingsScreen from '../components/settings/SettingsScreen';

export type TabParamList = {
  Counter: undefined;
  // Statistics: undefined; // Removed Statistics page
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const dimensions = useResponsiveDimensions();
  
  // Responsive tab bar dimensions
  const tabBarHeight = dimensions.isTablet ? 100 : 84;
  const iconSize = dimensions.isTablet ? 24 : 20;
  const labelFontSize = getResponsiveFontSize(12, dimensions);

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: dimensions.isTablet ? 12 : 8,
          paddingTop: dimensions.isTablet ? 12 : 8,
          height: tabBarHeight,
          elevation: 8,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: labelFontSize,
          fontWeight: '600',
          marginTop: dimensions.isTablet ? 6 : 4,
          letterSpacing: 0.25,
        },
        tabBarIconStyle: {
          marginTop: dimensions.isTablet ? 6 : 4,
        },
      }}
    >
      <Tab.Screen
        name="Counter"
        component={WillCounterScreen}
        options={{
          tabBarLabel: 'Counter',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ 
              fontSize: focused ? iconSize + 4 : iconSize, 
              color 
            }}>
              🎯
            </Text>
          ),
        }}
      />
      {/*
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
      */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ 
              fontSize: focused ? iconSize + 4 : iconSize, 
              color 
            }}>
              ⚙️
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;