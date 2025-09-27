import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  TouchableOpacity,
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
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { getResponsivePadding, getMaxContentWidth } from '../../utils/responsive';

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
  const dimensions = useResponsiveDimensions();
  
  // Local state for UI elements
  const [dailyGoal] = useState<number>(10);
  const [streak, setStreak] = useState<number>(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [hasShownModalForCurrentGoal, setHasShownModalForCurrentGoal] = useState(false);

  // Load today's count on component mount
  useEffect(() => {
    // Load count immediately for testing (bypassing auth for now)
    dispatch(fetchTodayCount('') as any);
  }, [dispatch]);

  // Debug count changes
  useEffect(() => {
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
    // Backend API will extract user from JWT token
    dispatch(incrementCount('') as any);
    triggerHaptic('light');
    
    // Check if daily goal is reached - show modal immediately
    if (count + 1 === dailyGoal && !hasShownModalForCurrentGoal) {
      triggerHaptic('heavy');
      setStreak(prev => prev + 1);
      setShowGoalModal(true);
      setHasShownModalForCurrentGoal(true);
    }
  }, [dispatch, count, dailyGoal, triggerHaptic]);

  // Handle modal dismiss
  const handleModalDismiss = useCallback(() => {
    setShowGoalModal(false);
  }, []);

  // Reset modal flag when count resets (new day)
  useEffect(() => {
    if (count < dailyGoal) {
      setHasShownModalForCurrentGoal(false);
    }
  }, [count, dailyGoal]);



  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const responsivePadding = getResponsivePadding(dimensions);
  const maxContentWidth = getMaxContentWidth(dimensions);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingHorizontal: responsivePadding,
            maxWidth: maxContentWidth,
            alignSelf: 'center',
            width: '100%',
            justifyContent: dimensions.isTablet ? 'center' : 'flex-start',
            minHeight: dimensions.isTablet ? '100%' : undefined,
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Will Counter</Text>
          <Text style={styles.subtitle}>Tap the circle to increment</Text>
          {error && (
            <Text style={styles.errorText}>Error: {error}</Text>
          )}
        </View>

        {/* Main Content - Responsive Layout */}
        {dimensions.isTablet && dimensions.isLandscape ? (
          <View style={styles.tabletLayout}>
            {/* Left side: Counter */}
            <View style={styles.counterSection}>
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
            
            {/* Right side: Statistics */}
            <View style={styles.statsSection}>
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
            </View>
          </View>
        ) : (
          <>
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
          </>
        )}

      </ScrollView>

      {/* Goal Achievement Modal */}
      <Modal
        visible={showGoalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalDismiss}
        testID="goal-modal"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.congratsTitle}>Congratulations!</Text>
            <Text style={styles.congratsMessage}>You reached your goal!</Text>
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={handleModalDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.dismissButtonText}>Awesome!</Text>
            </TouchableOpacity>
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
  // Tablet layout styles
  tabletLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 48,
    flex: 1,
  },
  counterSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 32,
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
    minWidth: 280,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  congratsMessage: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  dismissButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dismissButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WillCounterScreen;