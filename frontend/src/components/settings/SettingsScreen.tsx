import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppPreferences {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  darkMode: boolean;
  notifications: boolean;
  dailyGoal: number;
}

const PREFERENCES_KEY = '@will_counter_preferences';

const SettingsScreen: React.FC = () => {
  const [preferences, setPreferences] = useState<AppPreferences>({
    soundEnabled: true,
    hapticEnabled: true,
    darkMode: false,
    notifications: true,
    dailyGoal: 10,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const updatePreference = async (key: keyof AppPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['@will_counter_data', PREFERENCES_KEY]);
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={{ fontSize: 24, color: "#667eea" }}>{icon}</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e9ecef', true: '#667eea' }}
        thumbColor={value ? '#ffffff' : '#ffffff'}
        ios_backgroundColor="#e9ecef"
      />
    </View>
  );

  const renderActionItem = (
    title: string,
    subtitle: string,
    icon: string,
    onPress: () => void,
    destructive: boolean = false
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Text 
          style={{ 
            fontSize: 24, 
            color: destructive ? '#e17055' : '#667eea' 
          }}
        >
          {icon}
        </Text>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
            {title}
          </Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 16, color: "#6c757d" }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          {renderSettingItem(
            'Sound Effects',
            'Play sounds for button interactions',
            '🔊',
            preferences.soundEnabled,
            (value) => updatePreference('soundEnabled', value)
          )}

          {renderSettingItem(
            'Haptic Feedback',
            'Feel vibrations on button press',
            '📳',
            preferences.hapticEnabled,
            (value) => updatePreference('hapticEnabled', value)
          )}

          {renderSettingItem(
            'Push Notifications',
            'Receive reminder notifications',
            '🔔',
            preferences.notifications,
            (value) => updatePreference('notifications', value)
          )}

          {renderSettingItem(
            'Dark Mode',
            'Use dark theme (coming soon)',
            '🌙',
            preferences.darkMode,
            (value) => updatePreference('darkMode', value)
          )}
        </View>

        {/* Goal Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>
          
          <View style={styles.goalContainer}>
            <View style={styles.settingLeft}>
              <Text style={{ fontSize: 24, color: "#667eea" }}>🎯</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Daily Goal</Text>
                <Text style={styles.settingSubtitle}>Target willpower exercises per day</Text>
              </View>
            </View>
            <View style={styles.goalSelector}>
              <TouchableOpacity
                style={styles.goalButton}
                onPress={() => updatePreference('dailyGoal', Math.max(1, preferences.dailyGoal - 1))}
              >
                <Text style={{ fontSize: 16, color: "#667eea", fontWeight: 'bold' }}>−</Text>
              </TouchableOpacity>
              <Text style={styles.goalValue}>{preferences.dailyGoal}</Text>
              <TouchableOpacity
                style={styles.goalButton}
                onPress={() => updatePreference('dailyGoal', Math.min(50, preferences.dailyGoal + 1))}
              >
                <Text style={{ fontSize: 16, color: "#667eea", fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          {renderActionItem(
            'Export Data',
            'Download your progress data',
            '💾',
            () => {
              Alert.alert('Export Data', 'Data export feature coming soon!');
            }
          )}

          {renderActionItem(
            'Clear All Data',
            'Reset all counters and history',
            '🗑️',
            handleClearData,
            true
          )}
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          {renderActionItem(
            'App Version',
            'Will Counter v1.0.0',
            'ℹ️',
            () => {
              Alert.alert(
                'Will Counter',
                'Version 1.0.0\n\nA simple and effective app to track and strengthen your willpower.\n\nBuilt with React Native and Expo.'
              );
            }
          )}

          {renderActionItem(
            'Privacy Policy',
            'How we protect your data',
            '🔒',
            () => {
              Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
            }
          )}

          {renderActionItem(
            'Rate this App',
            'Leave a review on the App Store',
            '⭐',
            () => {
              Alert.alert('Rate App', 'Thank you for considering to rate our app!');
            }
          )}
        </View>

        {/* Developer Section */}
        <View style={styles.developerSection}>
          <Text style={styles.developerText}>
            Made with ❤️ for building stronger willpower
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  destructiveText: {
    color: '#e17055',
  },
  goalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  goalSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  goalButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  developerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  developerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SettingsScreen;