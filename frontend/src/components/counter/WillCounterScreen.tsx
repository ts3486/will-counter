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
import { useTheme } from '../../contexts/ThemeContext';
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
import GradientBackground from '../shared/GradientBackground';
import ThemedButton from '../shared/ThemedButton';
import type { AppDispatch } from '../../store/store';

// Type definitions
interface CounterHistoryItem {
  id: string;
  count: number;
  timestamp: Date;
  action: 'increment' | 'decrement' | 'reset';
}

const WillCounterScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const count = useSelector(selectTodayCount);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const dimensions = useResponsiveDimensions();
  const { theme } = useTheme();
  const headingColor = '#101418';
  const headerSurfaceColor = 'rgba(255, 255, 255, 0.86)';

  // Local state for UI elements
  const [dailyGoal] = useState<number>(10);
  const [streak, setStreak] = useState<number>(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [hasShownModalForCurrentGoal, setHasShownModalForCurrentGoal] = useState(false);

  // Load today's count on component mount
  useEffect(() => {
    // Load count immediately for testing (bypassing auth for now)
    dispatch(fetchTodayCount(''));
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
    dispatch(incrementCount(''));
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
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
              Loading...
            </Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const responsivePadding = getResponsivePadding(dimensions);
  const maxContentWidth = getMaxContentWidth(dimensions);

  return (
    <GradientBackground>
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
          <Text style={[styles.title, { color: headingColor }]}>
            Will Counter
          </Text>
          {error && (
            <Text style={[styles.errorText, { 
              color: theme.colors.status.error,
              backgroundColor: theme.colors.surface.elevated 
            }]}>
              Error: {error}
            </Text>
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
              <Text style={[styles.instructionText, { color: theme.colors.text.secondary }]}>
                Tap the circle to increment
              </Text>
            </View>
            {/* Right side: Statistics */}
            <View style={styles.statsSection}>
              <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface.elevated }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: headingColor }]}>Streak</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{streak}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: headingColor }]}>Today's Goal</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{dailyGoal}</Text>
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
              <Text style={[styles.instructionText, { color: theme.colors.text.secondary }]}>
                Tap the circle to increment
              </Text>
            </View>

            {/* Statistics */}
            <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface.elevated }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: headingColor }]}>Streak</Text>
                <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{streak}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: headingColor }]}>Today's Goal</Text>
                <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{dailyGoal}</Text>
              </View>
            </View>
          </>
        )}

      </ScrollView>
      </SafeAreaView>

      {/* Goal Achievement Modal */}
      <Modal
        visible={showGoalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalDismiss}
        testID="goal-modal"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface.primary }]}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={[styles.congratsTitle, { color: theme.colors.text.primary }]}>
              Congratulations!
            </Text>
            <Text style={[styles.congratsMessage, { color: theme.colors.text.secondary }]}>
              You reached your goal!
            </Text>
            <ThemedButton
              title="Awesome!"
              onPress={handleModalDismiss}
              variant="primary"
              size="medium"
            />
          </View>
        </View>
      </Modal>
    </GradientBackground>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 8,
    shadowColor: 'rgba(16, 20, 24, 0.2)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 20, 24, 0.08)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  instructionText: {
    fontSize: 15,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
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
