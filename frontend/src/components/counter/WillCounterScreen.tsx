import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchTodayCount,
  incrementCount,
  selectTodayCount,
  selectIsLoading,
  selectError
} from '../../store/slices/willCounterSlice';
import CircularCounter from './CircularCounter';
import GoalAchievement from './GoalAchievement';

// Type definitions
interface CounterHistoryItem {
  id: string;
  count: number;
  timestamp: Date;
  action: 'increment' | 'decrement' | 'reset';
}

const WillCounterScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const count = useSelector(selectTodayCount);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // Local state for UI elements
  const [dailyGoal] = useState<number>(10);
  const [streak, setStreak] = useState<number>(0);
  const [showGoalAchievement, setShowGoalAchievement] = useState(false);

  // Load today's count on component mount
  useEffect(() => {
    console.log('Component mounted, fetching today count');
    // Load count immediately for testing (bypassing auth for now)
    dispatch(fetchTodayCount(''));
  }, [dispatch]);

  // Debug count changes
  useEffect(() => {
    console.log('Count changed to:', count);
  }, [count]);

  // Update local history when count changes
  useEffect(() => {
    // Keep local history for UI, but main count comes from Redux
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


  // Increment counter
  const handleIncrement = useCallback((): void => {
    console.log('Handle increment called, current count:', count);
    // Backend API will extract user from JWT token
    dispatch(incrementCount(''));
    triggerHaptic('light');
    
    // Check if daily goal is reached
    if (count + 1 === dailyGoal) {
      triggerHaptic('heavy');
      setStreak(prev => prev + 1);
      setShowGoalAchievement(true);
    }
  }, [dispatch, count, dailyGoal, triggerHaptic]);

  // Handle goal achievement completion
  const handleGoalAnimationComplete = useCallback(() => {
    setShowGoalAchievement(false);
  }, []);



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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Will Counter</Text>
          <Text style={styles.subtitle}>Tap the circle to increment</Text>
          {error && (
            <Text style={styles.errorText}>Error: {error}</Text>
          )}
        </View>

        {/* Circular Counter */}
        <View style={styles.counterContainer}>
          <CircularCounter
            count={count}
            dailyGoal={dailyGoal}
            onIncrement={handleIncrement}
            isGoalReached={count >= dailyGoal}
            isLoading={isLoading}
          />
          <Text style={styles.instructionText}>
            Tap to track your willpower exercise
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{streak}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Today's Goal</Text>
            <Text style={styles.statValue}>{dailyGoal}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Goal Achievement Overlay */}
      <GoalAchievement 
        isVisible={showGoalAchievement}
        onAnimationComplete={handleGoalAnimationComplete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    paddingTop: 16,
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
    textAlign: 'center',
    lineHeight: 24,
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    paddingVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -1,
  },
  instructionText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});

export default WillCounterScreen;