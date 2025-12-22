import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withSpring, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import { Audio } from 'expo-av';

interface GoalAchievementProps {
  isVisible: boolean;
  onAnimationComplete: () => void;
}

const GoalAchievement: React.FC<GoalAchievementProps> = ({ 
  isVisible, 
  onAnimationComplete 
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      playGoalSound();
      triggerAnimation();
    }
  }, [isVisible]);

  const playGoalSound = async () => {
    try {
      // For now, we'll skip the sound since we don't have an audio file
      // You can add a sound file later and uncomment this
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../../assets/sounds/goal-achieved.mp3')
      // );
      // await sound.playAsync();
      console.log('Goal achieved sound would play here');
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const triggerAnimation = () => {
    // Bouncy entrance with multiple bounces
    scale.value = withSequence(
      withSpring(0.8, { duration: 150 }),
      withSpring(1.3, { duration: 200 }),
      withSpring(0.9, { duration: 150 }),
      withSpring(1.1, { duration: 150 }),
      withSpring(1, { duration: 100 })
    );
    
    // Fade in then pulse before fade out
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.7, { duration: 300 }),
      withTiming(1, { duration: 300 }),
      withTiming(0.7, { duration: 300 }),
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 800 })
    );
    
    // Wiggle rotation animation
    rotation.value = withSequence(
      withTiming(-15, { duration: 100 }),
      withTiming(15, { duration: 200 }),
      withTiming(-10, { duration: 150 }),
      withTiming(10, { duration: 150 }),
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Call completion callback after animation
    setTimeout(() => {
      runOnJS(onAnimationComplete)();
    }, 3500);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` }
    ] as const,
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <View style={styles.celebrationContainer}>
        <Text style={styles.celebrationText}>🎉</Text>
        <Text style={styles.achievementText}>Goal Achieved!</Text>
        <Text style={styles.congratsText}>Congratulations!</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  celebrationContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 48,
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    marginHorizontal: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  celebrationText: {
    fontSize: 72,
    marginBottom: 24,
  },
  achievementText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  congratsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
});

export default GoalAchievement;