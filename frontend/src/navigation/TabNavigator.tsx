import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';
import { getResponsiveFontSize } from '../utils/responsive';
import { useTheme } from '../contexts/ThemeContext';

import WillCounterScreen from '../components/counter/WillCounterScreen';
import HistoryScreen from '../components/history/HistoryScreen';
// import StatisticsScreen from '../components/statistics/StatisticsScreen'; // Removed Statistics page
import SettingsScreen from '../components/settings/SettingsScreen';

export type TabParamList = {
  Counter: undefined;
  History: undefined;
  // Statistics: undefined; // Removed Statistics page
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const dimensions = useResponsiveDimensions();
  const { theme } = useTheme();
  const navLabelColor = '#101418';
  const navLabelMuted = 'rgba(16, 20, 24, 0.6)';
  
  // Responsive tab bar dimensions
  const tabBarHeight = dimensions.isTablet ? 100 : 84;
  const iconSize = dimensions.isTablet ? 24 : 20;
  const labelFontSize = getResponsiveFontSize(12, dimensions);

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: navLabelColor,
        tabBarInactiveTintColor: navLabelMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface.primary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
          paddingBottom: dimensions.isTablet ? 12 : 8,
          paddingTop: dimensions.isTablet ? 12 : 8,
          height: tabBarHeight,
          elevation: 8,
          shadowColor: theme.colors.text.primary,
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
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ 
              fontSize: focused ? iconSize + 4 : iconSize, 
              color 
            }}>
              📈
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
