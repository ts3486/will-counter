import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Types for statistics data
interface DailyData {
  date: string;
  count: number;
}

interface StatsSummary {
  totalCount: number;
  averageDaily: number;
  bestDay: number;
  streak: number;
  weeklyData: DailyData[];
}

const StatisticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');
  const [stats, setStats] = useState<StatsSummary>({
    totalCount: 0,
    averageDaily: 0,
    bestDay: 0,
    streak: 0,
    weeklyData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const savedData = await AsyncStorage.getItem('@will_counter_data');
      
      if (savedData) {
        const data = JSON.parse(savedData);
        const history = data.history || [];
        
        // Generate mock weekly data for visualization
        const weeklyData = generateWeeklyData(history);
        
        // Calculate statistics
        const totalCount = data.count || 0;
        const days = parseInt(selectedPeriod);
        const averageDaily = Math.round(totalCount / days);
        const bestDay = Math.max(totalCount, 12); // Mock best day
        const streak = data.streak || 0;

        setStats({
          totalCount,
          averageDaily,
          bestDay,
          streak,
          weeklyData,
        });
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyData = (history: any[]): DailyData[] => {
    const data: DailyData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayHistory = history.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toDateString() === date.toDateString();
      });
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: Math.max(0, dayHistory.length + Math.floor(Math.random() * 8)),
      });
    }
    
    return data;
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['7', '30', '90'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive,
            ]}
          >
            {period}d
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatCard = (title: string, value: string, subtitle: string, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={{ fontSize: 24, color }}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderWeeklyChart = () => {
    const maxCount = Math.max(...stats.weeklyData.map(d => d.count), 1);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Progress</Text>
        <View style={styles.chart}>
          {stats.weeklyData.map((day, index) => (
            <View key={index} style={styles.chartBar}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((day.count / maxCount) * 120, 4),
                    backgroundColor: day.count > 0 ? '#3B82F6' : '#E2E8F0',
                  },
                ]}
              />
              <Text style={styles.chartLabel}>{day.date}</Text>
              <Text style={styles.chartValue}>{day.count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
          <Text style={styles.subtitle}>Track your willpower journey</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.selectorContainer}>
          {renderPeriodSelector()}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatCard('Total Count', stats.totalCount.toString(), `Last ${selectedPeriod} days`, '📈', '#3B82F6')}
            {renderStatCard('Daily Average', stats.averageDaily.toString(), 'Per day', '📊', '#10B981')}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard('Best Day', stats.bestDay.toString(), 'Highest count', '⭐', '#F59E0B')}
            {renderStatCard('Current Streak', stats.streak.toString(), 'Days in a row', '🔥', '#FF6B35')}
          </View>
        </View>

        {/* Weekly Chart */}
        {renderWeeklyChart()}

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>📊 Insights</Text>
          <View style={styles.insightsList}>
            {stats.totalCount === 0 ? (
              <View style={styles.insightItem}>
                <Text style={{ fontSize: 20, color: "#3B82F6" }}>💡</Text>
                <Text style={styles.insightText}>
                  Start tracking your willpower to see personalized insights here!
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.insightItem}>
                  <Text style={{ fontSize: 20, color: "#10B981" }}>✅</Text>
                  <Text style={styles.insightText}>
                    You've successfully resisted temptation {stats.totalCount} times
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={{ fontSize: 20, color: "#3B82F6" }}>📈</Text>
                  <Text style={styles.insightText}>
                    Your willpower is getting stronger each day
                  </Text>
                </View>
                {stats.streak > 0 && (
                  <View style={styles.insightItem}>
                    <Text style={{ fontSize: 20, color: "#FF6B35" }}>🔥</Text>
                    <Text style={styles.insightText}>
                      You're on a {stats.streak}-day streak! Keep it up!
                    </Text>
                  </View>
                )}
                {stats.averageDaily > 5 && (
                  <View style={styles.insightItem}>
                    <Text style={{ fontSize: 20, color: "#F59E0B" }}>🏆</Text>
                    <Text style={styles.insightText}>
                      Excellent consistency! You're building strong habits
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
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
    marginBottom: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  selectorContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.25,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
    letterSpacing: -0.1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  chartContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.25,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: 20,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.25,
  },
  chartValue: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
  },
  insightsContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.25,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
    fontWeight: '400',
  },
});

export default StatisticsScreen;