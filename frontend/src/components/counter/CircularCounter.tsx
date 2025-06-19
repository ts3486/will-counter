import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

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
  const rotation = useSharedValue(0);

  // Calculate progress percentage
  const progressPercentage = Math.min((count || 0) / (dailyGoal || 1), 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progressPercentage);

  // Animated styles
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Handle tap animation
  const handleTap = () => {
    scale.value = withSequence(
      withSpring(1.1, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
    onIncrement();
  };

  // Goal achievement animation
  React.useEffect(() => {
    if (isGoalReached) {
      rotation.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(0, { duration: 0 })
      );
    }
  }, [isGoalReached, rotation]);

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
          {/* Progress circle - blue to orange when complete */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={isGoalReached ? "#FF6B35" : "#3B82F6"}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
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