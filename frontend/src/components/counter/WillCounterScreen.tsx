import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import HapticFeedback from 'react-native-haptic-feedback';
import { AppDispatch, RootState } from '../../store/store';
import {
  fetchTodayCount,
  incrementCount,
  incrementOfflineCount,
  selectTodayCount,
  selectIsLoading,
  selectError,
  clearError,
} from '../../store/slices/willCounterSlice';
import { logout } from '../../store/slices/authSlice';
import SoundPlayer from '../shared/SoundPlayer';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { OfflineService } from '../../services/OfflineService';
import { NetworkService } from '../../services/NetworkService';

const WillCounterScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { preferences } = useSelector((state: RootState) => state.user);
  const todayCount = useSelector(selectTodayCount);
  const loading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const { isOffline, offlineIncrementCount } = useOfflineSync();
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTodayCount(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCountPress = useCallback(async () => {
    if (!user?.id) return;

    // Haptic feedback
    if (preferences.notificationEnabled) {
      HapticFeedback.trigger('impactMedium');
    }

    // Sound feedback
    if (preferences.soundEnabled) {
      SoundPlayer.playCountSound();
    }

    // Button animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for count display
    Animated.sequence([
      Animated.timing(pulseValue, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (NetworkService.getIsConnected()) {
        // Try online increment first
        await dispatch(incrementCount(user.id)).unwrap();
      } else {
        // Store offline increment
        await OfflineService.storeOfflineIncrement({
          timestamp: new Date().toISOString(),
          count: 1,
        });
        dispatch(incrementOfflineCount());
      }
    } catch (error) {
      // Fallback to offline increment on any error
      await OfflineService.storeOfflineIncrement({
        timestamp: new Date().toISOString(),
        count: 1,
      });
      dispatch(incrementOfflineCount());
    }
  }, [
    user?.id,
    preferences.notificationEnabled,
    preferences.soundEnabled,
    dispatch,
    scaleValue,
    pulseValue,
  ]);

  const handleLogout = useCallback(async () => {
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
  }, [dispatch]);

  const formatCount = (count: number) => {
    return count.toString().padStart(3, '0');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>
              📡 Offline mode - {offlineIncrementCount} pending sync
            </Text>
          </View>
        )}

        <View style={styles.countSection}>
          <Text style={styles.label}>Today's Will Power</Text>
          <Animated.View style={[styles.countContainer, { transform: [{ scale: pulseValue }] }]}>
            <Text style={styles.count}>{formatCount(todayCount + offlineIncrementCount)}</Text>
          </Animated.View>
        </View>

        <View style={styles.buttonSection}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={[styles.counterButton, loading && styles.counterButtonDisabled]}
              onPress={handleCountPress}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.instruction}>
            Tap the button each time you resist a temptation
          </Text>
        </View>

        <View style={styles.motivationSection}>
          <Text style={styles.motivationText}>
            {(todayCount + offlineIncrementCount) === 0 
              ? "Start building your willpower!"
              : (todayCount + offlineIncrementCount) < 5
              ? "Great start! Keep going!"
              : (todayCount + offlineIncrementCount) < 10
              ? "You're building momentum!"
              : "Amazing willpower! You're unstoppable!"
            }
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  countSection: {
    alignItems: 'center',
    marginBottom: 64,
  },
  label: {
    fontSize: 20,
    color: '#636E72',
    marginBottom: 16,
    fontWeight: '500',
  },
  countContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  count: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#6C5CE7',
    textAlign: 'center',
  },
  buttonSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  counterButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  counterButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  motivationSection: {
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 18,
    color: '#2D3436',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
  },
  offlineIndicator: {
    backgroundColor: '#FFA726',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default WillCounterScreen;