import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTodayCount,
  incrementCount,
  selectTodayCount,
  selectIsLoading
} from '../../store/slices/willCounterSlice';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

// Type definitions
interface CounterHistoryItem {
  id: string;
  count: number;
  timestamp: Date;
  action: 'increment' | 'decrement' | 'reset';
}

interface WillCounterState {
  count: number;
  history: CounterHistoryItem[];
  dailyGoal: number;
  streak: number;
}

// Constants
const STORAGE_KEY = '@will_counter_data';
const { width: screenWidth } = Dimensions.get('window');

const WillCounterScreen: React.FC = () => {
  const dispatch = useDispatch();
  const count = useSelector(selectTodayCount);
  const isLoading = useSelector(selectIsLoading);
  
  // Local state for UI elements
  const [history, setHistory] = useState<CounterHistoryItem[]>([]);
  const [dailyGoal] = useState<number>(10);
  const [streak, setStreak] = useState<number>(0);

  // Animation values
  const countScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  // Load today's count on component mount
  useEffect(() => {
    const userId = '2999122f-8691-42a3-829c-c2641f6da63f'; // Test user ID from Supabase
    dispatch(fetchTodayCount(userId));
  }, [dispatch]);

  // Update local history when count changes
  useEffect(() => {
    // Keep local history for UI, but main count comes from Redux
  }, [count]);

  // Update progress animation when count changes
  useEffect(() => {
    const progress = Math.min(count / dailyGoal, 1);
    progressWidth.value = withSpring(progress * 100);
  }, [count, dailyGoal]);


  // Add item to history
  const addHistoryItem = useCallback((action: CounterHistoryItem['action']): void => {
    const newHistoryItem: CounterHistoryItem = {
      id: Date.now().toString(),
      count: action === 'reset' ? 0 : count + (action === 'increment' ? 1 : -1),
      timestamp: new Date(),
      action,
    };

    setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep only last 10 items
  }, [count]);

  // Trigger haptic feedback
  const triggerHaptic = useCallback(async (type: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> => {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    }
  }, []);

  // Counter animation
  const animateCount = useCallback((): void => {
    countScale.value = withSequence(
      withSpring(1.2, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
  }, []);

  // Button animation
  const animateButton = useCallback((callback: () => void): void => {
    buttonScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 }, () => {
        runOnJS(callback)();
      })
    );
  }, []);

  // Increment counter
  const handleIncrement = useCallback((): void => {
    animateButton(() => {
      const userId = '2999122f-8691-42a3-829c-c2641f6da63f'; // Test user ID from Supabase
      dispatch(incrementCount(userId));
      addHistoryItem('increment');
      animateCount();
      triggerHaptic('light');
      
      // Check if daily goal is reached
      if (count + 1 === dailyGoal) {
        triggerHaptic('heavy');
        setStreak(prev => prev + 1);
        Alert.alert('🎉 Goal Reached!', `Congratulations! You've reached your daily goal of ${dailyGoal}!`);
      }
    });
  }, [dispatch, count, dailyGoal, addHistoryItem, animateCount, triggerHaptic, animateButton]);

  // Decrement counter (keeping local logic for now)
  const handleDecrement = useCallback((): void => {
    if (count > 0) {
      animateButton(() => {
        // Note: This would need a decrement API endpoint
        addHistoryItem('decrement');
        animateCount();
        triggerHaptic('light');
      });
    }
  }, [count, addHistoryItem, animateCount, triggerHaptic, animateButton]);

  // Reset counter
  const handleReset = useCallback((): void => {
    Alert.alert(
      'Reset Counter',
      'Are you sure you want to reset your counter to zero?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Note: This would need a reset API endpoint
            addHistoryItem('reset');
            animateCount();
            triggerHaptic('medium');
          },
        },
      ]
    );
  }, [addHistoryItem, animateCount, triggerHaptic]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Animated styles
  const countAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Will Counter</Text>
          <Text style={styles.subtitle}>Building willpower, one choice at a time</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
          <Text style={styles.progressText}>
            {count} / {dailyGoal} daily goal
          </Text>
        </View>

        {/* Main Counter */}
        <View style={styles.counterContainer}>
          <Animated.View style={[styles.countDisplay, countAnimatedStyle]}>
            <View style={styles.countGradient}>
              <Text style={styles.countText}>{count.toString().padStart(3, '0')}</Text>
            </View>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[styles.actionButton, styles.decrementButton]}
              onPress={handleDecrement}
              disabled={count === 0}
              accessibilityLabel="Decrease counter"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>−</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[styles.actionButton, styles.incrementButton]}
              onPress={handleIncrement}
              accessibilityLabel="Increase counter"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          accessibilityLabel="Reset counter to zero"
          accessibilityRole="button"
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round((count / dailyGoal) * 100)}%</Text>
            <Text style={styles.statLabel}>Today's Progress</Text>
          </View>
        </View>

        {/* History Section */}
        {history.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Activity</Text>
            {history.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Text style={styles.historyIconText}>
                    {item.action === 'increment' ? '+' : item.action === 'decrement' ? '−' : '↻'}
                  </Text>
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyAction}>
                    {item.action === 'increment' && 'Increased to '}
                    {item.action === 'decrement' && 'Decreased to '}
                    {item.action === 'reset' && 'Reset to '}
                    <Text style={styles.historyCount}>{item.count}</Text>
                  </Text>
                  <Text style={styles.historyTime}>{formatTimestamp(item.timestamp)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
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
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  countDisplay: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  countGradient: {
    paddingVertical: 32,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  countText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  incrementButton: {
    backgroundColor: '#00b894',
  },
  decrementButton: {
    backgroundColor: '#e17055',
  },
  buttonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resetButton: {
    backgroundColor: '#74b9ff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 32,
    elevation: 3,
    shadowColor: '#74b9ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    textAlign: 'center',
  },
  historyContainer: {
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: 14,
    color: '#2d3436',
    marginBottom: 2,
  },
  historyCount: {
    fontWeight: '600',
    color: '#667eea',
  },
  historyTime: {
    fontSize: 12,
    color: '#6c757d',
  },
});

export default WillCounterScreen;