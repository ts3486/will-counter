import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  updatePreference,
  updateUserPreferences,
} from '../../store/slices/userSlice';
import { logout } from '../../store/slices/authSlice';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { preferences, loading } = useSelector((state: RootState) => state.user);

  const handlePreferenceChange = async (key: keyof typeof preferences, value: any) => {
    // Update local state immediately
    dispatch(updatePreference({ key, value }));

    // Update in database
    const newPreferences = { ...preferences, [key]: value };
    if (user?.id) {
      try {
        await dispatch(updateUserPreferences({
          auth0Id: user.id,
          preferences: newPreferences,
        })).unwrap();
      } catch (error) {
        // Revert local change on error
        dispatch(updatePreference({ key, value: preferences[key] }));
        Alert.alert('Error', 'Failed to update preferences');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E8E8E8', true: '#6C5CE7' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor="#E8E8E8"
      />
    </View>
  );

  const renderActionItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    destructive: boolean = false
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {renderSettingItem(
            'Sound Effects',
            'Play sound when incrementing counter',
            preferences.soundEnabled,
            (value) => handlePreferenceChange('soundEnabled', value)
          )}

          {renderSettingItem(
            'Haptic Feedback',
            'Vibrate when incrementing counter',
            preferences.notificationEnabled,
            (value) => handlePreferenceChange('notificationEnabled', value)
          )}

          {renderSettingItem(
            'Dark Mode',
            'Use dark theme',
            preferences.theme === 'dark',
            (value) => handlePreferenceChange('theme', value ? 'dark' : 'light')
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Email</Text>
            <Text style={styles.accountValue}>{user?.email}</Text>
          </View>

          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>User ID</Text>
            <Text style={styles.accountValue}>{user?.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          {renderActionItem(
            'Export Data',
            'Download your willpower data',
            () => {
              Alert.alert('Export Data', 'Data export feature coming soon!');
            }
          )}

          {renderActionItem(
            'Delete All Data',
            'Permanently delete all your data',
            () => {
              Alert.alert(
                'Delete All Data',
                'Are you sure? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Delete Data', 'Data deletion feature coming soon!');
                    },
                  },
                ]
              );
            },
            true
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          
          {renderActionItem(
            'About',
            'Version 1.0.0',
            () => {
              Alert.alert(
                'Will Counter',
                'Version 1.0.0\n\nA simple app to track and strengthen your willpower.\n\nBuilt with React Native, Auth0, and Supabase.'
              );
            }
          )}

          {renderActionItem(
            'Privacy Policy',
            'Read our privacy policy',
            () => {
              Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
            }
          )}

          {renderActionItem(
            'Terms of Service',
            'Read our terms of service',
            () => {
              Alert.alert('Terms of Service', 'Terms of service coming soon!');
            }
          )}
        </View>

        <View style={styles.section}>
          {renderActionItem(
            'Logout',
            'Sign out of your account',
            handleLogout,
            true
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3436',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  destructiveText: {
    color: '#E17055',
  },
  accountInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636E72',
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    color: '#2D3436',
  },
});

export default SettingsScreen;