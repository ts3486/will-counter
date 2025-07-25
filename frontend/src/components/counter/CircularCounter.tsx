import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps,
  withSpring, 
  withSequence,
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

// Create animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: screenWidth } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(screenWidth * 0.7, 300);
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CircularCounterProps {
  count: number;
  dailyGoal: number;
  onIncrement: () => void;
  isGoalReached: boolean;
  isLoading?: boolean;
}

const CircularCounter: React.FC<CircularCounterProps> = ({ 
  count, 
  dailyGoal, 
  onIncrement, 
  isGoalReached,
  isLoading = false
}) => {
  const scale = useSharedValue(1);
  const animatedProgress = useSharedValue(0);

  // Calculate progress percentage
  const progressPercentage = Math.min((count || 0) / (dailyGoal || 1), 1);

  // Animated styles
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Animated progress props - smooth transition for progress bar
  const animatedProgressStyle = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  // Handle tap animation - smooth button press feel
  const handleTap = () => {
    // Scale down then back up for natural button press feel
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }), // Quick scale down
      withSpring(1, { 
        duration: 200,
        dampingRatio: 0.6,
        stiffness: 150
      }) // Smooth spring back up
    );
    onIncrement();
  };

  // Smooth progress animation when count changes
  React.useEffect(() => {
    animatedProgress.value = withTiming(progressPercentage, {
      duration: 400, // 400ms smooth animation
    });
  }, [progressPercentage, animatedProgress]);

  return (
    <TouchableOpacity onPress={handleTap} activeOpacity={0.9} disabled={isLoading}>
      <Animated.View style={[styles.circleContainer, circleStyle, isLoading && styles.loadingContainer]}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          {/* Background circle - calm foundation */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke="#E2E8F0"
            strokeWidth={STROKE_WIDTH}
            fill="#F8FAFC"
            fillOpacity={1}
          />
          {/* Inner button circle - subtle depth */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS - 8}
            stroke="#CBD5E1"
            strokeWidth={2}
            fill="#FFFFFF"
            fillOpacity={0.9}
          />
          {/* Progress circle - blue to orange when complete with smooth animation */}
          <AnimatedCircle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={isGoalReached ? "#FF6B35" : "#3B82F6"}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProgressStyle}
            strokeLinecap="round"
            transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
          />
        </Svg>
        
        {/* Counter text */}
        <View style={styles.textContainer}>
          <Text style={[styles.countText, isGoalReached && styles.goalReachedText]}>
            {isLoading ? '...' : (count || 0)}
          </Text>
          <Text style={styles.goalText}>
            {isLoading ? 'Updating' : `/ ${dailyGoal || 10}`}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: 'transparent',
    borderRadius: CIRCLE_SIZE / 2,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -1,
  },
  goalReachedText: {
    color: '#EA580C',
  },
  goalText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    opacity: 0.6,
  },
});

export default CircularCounter;