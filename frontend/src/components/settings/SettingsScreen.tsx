import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { resetCount, selectTodayCount, selectIsLoading } from '../../store/slices/willCounterSlice';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { getResponsivePadding, getMaxContentWidth } from '../../utils/responsive';

interface AppPreferences {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  darkMode: boolean;
  notifications: boolean;
  dailyGoal: number;
}

const PREFERENCES_KEY = '@will_counter_preferences';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todayCount = useSelector(selectTodayCount);
  const isLoading = useSelector(selectIsLoading);
  const { user, logout, loading: authLoading } = useAuth();
  const dimensions = useResponsiveDimensions();
  
  const [preferences, setPreferences] = useState<AppPreferences>({
    soundEnabled: true,
    hapticEnabled: true,
    darkMode: false,
    notifications: true,
    dailyGoal: 10,
  });
  
  const [showResetModal, setShowResetModal] = useState(false);

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

  const handleResetCount = () => {
    setShowResetModal(true);
  };

  const confirmResetCount = async () => {
    try {
      await dispatch(resetCount(''));
      setShowResetModal(false);
      Alert.alert('Success', 'Your will count has been reset to 0.');
    } catch (error) {
      setShowResetModal(false);
      Alert.alert('Error', 'Failed to reset count. Please try again.');
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
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
        <Text style={{ fontSize: 24, color: "#3B82F6" }}>{icon}</Text>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
        thumbColor={value ? '#ffffff' : '#ffffff'}
        ios_backgroundColor="#E2E8F0"
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
            color: destructive ? '#EF4444' : '#3B82F6' 
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
      <Text style={{ fontSize: 16, color: "#64748B" }}>›</Text>
    </TouchableOpacity>
  );

  const renderUserInfoItem = (
    title: string,
    value: string,
    icon: string | React.ReactNode,
    isLoading: boolean = false
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        {typeof icon === 'string' ? (
          <Text style={{ fontSize: 24, color: "#3B82F6" }}>{icon}</Text>
        ) : (
          icon
        )}
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>
            {isLoading ? 'Loading...' : value || 'Not available'}
          </Text>
        </View>
      </View>
    </View>
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Not available';
    }
  };

  const responsivePadding = getResponsivePadding(dimensions);
  const maxContentWidth = getMaxContentWidth(dimensions);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: responsivePadding,
          maxWidth: maxContentWidth,
          alignSelf: 'center',
          width: '100%',
          justifyContent: dimensions.isTablet ? 'center' : 'flex-start',
          minHeight: dimensions.isTablet ? '100%' : undefined,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>

        {/* Responsive Layout for Tablet */}
        {dimensions.isTablet ? (
          <View style={styles.tabletSectionsContainer}>
            {/* Left Column */}
            <View style={styles.settingsColumn}>
              {/* User Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User</Text>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.profileImageContainer}>
                      {user?.picture ? (
                        <Image 
                          source={{ uri: user.picture }} 
                          style={styles.profileImage}
                          onError={() => {}}
                        />
                      ) : (
                        <View style={styles.profilePlaceholder}>
                          <Text style={styles.profilePlaceholderText}>👤</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>
                        {authLoading ? 'Loading...' : (user?.name || user?.email?.split('@')[0] || 'User')}
                      </Text>
                      <Text style={styles.settingSubtitle}>
                        {authLoading ? 'Loading...' : (user?.email || 'No email available')}
                      </Text>
                    </View>
                  </View>
                </View>
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
                      <Text style={{ fontSize: 16, color: "#3B82F6", fontWeight: 'bold' }}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.goalValue}>{preferences.dailyGoal}</Text>
                    <TouchableOpacity
                      style={styles.goalButton}
                      onPress={() => updatePreference('dailyGoal', Math.min(50, preferences.dailyGoal + 1))}
                    >
                      <Text style={{ fontSize: 16, color: "#3B82F6", fontWeight: 'bold' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Today's Count */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Count</Text>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Text style={{ fontSize: 24, color: "#3B82F6" }}>📊</Text>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>Today's Progress</Text>
                      <Text style={styles.settingSubtitle}>Current count: {todayCount}</Text>
                    </View>
                  </View>
                </View>
                {renderActionItem(
                  'Reset Today\'s Count',
                  `Current count: ${todayCount} • Reset to 0`,
                  '🔄',
                  handleResetCount,
                  false
                )}
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.settingsColumn}>
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

              {/* Account Management */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                {renderActionItem(
                  'Logout',
                  'Sign out of your account',
                  '🚪',
                  handleLogout,
                  true
                )}
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Phone Layout - Single Column */}
            {/* User Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.profileImageContainer}>
                    {user?.picture ? (
                      <Image 
                        source={{ uri: user.picture }} 
                        style={styles.profileImage}
                        onError={() => {}}
                      />
                    ) : (
                      <View style={styles.profilePlaceholder}>
                        <Text style={styles.profilePlaceholderText}>👤</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>
                      {authLoading ? 'Loading...' : (user?.name || user?.email?.split('@')[0] || 'User')}
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      {authLoading ? 'Loading...' : (user?.email || 'No email available')}
                    </Text>
                  </View>
                </View>
              </View>
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
                    <Text style={{ fontSize: 16, color: "#3B82F6", fontWeight: 'bold' }}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.goalValue}>{preferences.dailyGoal}</Text>
                  <TouchableOpacity
                    style={styles.goalButton}
                    onPress={() => updatePreference('dailyGoal', Math.min(50, preferences.dailyGoal + 1))}
                  >
                    <Text style={{ fontSize: 16, color: "#3B82F6", fontWeight: 'bold' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Today's Count */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Count</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={{ fontSize: 24, color: "#3B82F6" }}>📊</Text>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Today's Progress</Text>
                    <Text style={styles.settingSubtitle}>Current count: {todayCount}</Text>
                  </View>
                </View>
              </View>
              {renderActionItem(
                'Reset Today\'s Count',
                `Current count: ${todayCount} • Reset to 0`,
                '🔄',
                handleResetCount,
                false
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

            {/* Account Management */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              {renderActionItem(
                'Logout',
                'Sign out of your account',
                '🚪',
                handleLogout,
                true
              )}
            </View>
          </>
        )}

        {/* Developer Section */}
        {/*
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          {/* Developer-related settings and actions */}
        {/*</View>
        */}
      </ScrollView>

      {/* Reset Count Warning Modal */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Text style={styles.modalTitle}>Reset Today's Count?</Text>
            <Text style={styles.modalMessage}>
              You currently have {todayCount} will exercises recorded today.
              {"\n\n"}
              This will reset your count to 0 and save the change to the database.
              {"\n\n"}
              This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowResetModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={confirmResetCount}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.resetButtonText}>
                  {isLoading ? 'Resetting...' : 'Reset Count'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  // Tablet layout styles
  tabletSectionsContainer: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start',
  },
  settingsColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.25,
  },
  settingItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  destructiveText: {
    color: '#EF4444',
  },
  goalContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  goalButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  developerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  developerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 320,
    maxWidth: 400,
  },
  warningEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Profile image styles
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  profilePlaceholderText: {
    fontSize: 20,
    color: '#64748B',
  },
});

export default SettingsScreen;