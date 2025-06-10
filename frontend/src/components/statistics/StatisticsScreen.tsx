import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchUserStatistics } from '../../store/slices/userSlice';
import StatisticsChart from './StatisticsChart';
import StatisticsCard from './StatisticsCard';

const { width } = Dimensions.get('window');

const StatisticsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { statistics, loading } = useSelector((state: RootState) => state.user);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserStatistics({
        userId: user.id,
        days: parseInt(selectedPeriod),
      }));
    }
  }, [dispatch, user?.id, selectedPeriod]);

  const calculateStats = () => {
    if (!statistics.length) {
      return {
        totalCount: 0,
        averageDaily: 0,
        bestDay: 0,
        streak: 0,
      };
    }

    const totalCount = statistics.reduce((sum, stat) => sum + stat.count, 0);
    const averageDaily = Math.round(totalCount / statistics.length);
    const bestDay = Math.max(...statistics.map(stat => stat.count));
    
    // Calculate current streak
    let streak = 0;
    for (let i = 0; i < statistics.length; i++) {
      if (statistics[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalCount,
      averageDaily,
      bestDay,
      streak,
    };
  };

  const stats = calculateStats();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        {renderPeriodSelector()}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatisticsCard
            title="Total Count"
            value={stats.totalCount.toString()}
            subtitle={`Last ${selectedPeriod} days`}
            color="#6C5CE7"
          />
          <StatisticsCard
            title="Daily Average"
            value={stats.averageDaily.toString()}
            subtitle="Per day"
            color="#00B894"
          />
          <StatisticsCard
            title="Best Day"
            value={stats.bestDay.toString()}
            subtitle="Highest count"
            color="#FDCB6E"
          />
          <StatisticsCard
            title="Current Streak"
            value={stats.streak.toString()}
            subtitle="Days in a row"
            color="#E17055"
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Daily Progress</Text>
          <StatisticsChart
            data={statistics}
            width={width - 48}
            height={200}
          />
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Insights</Text>
          <View style={styles.insightsList}>
            {stats.totalCount === 0 ? (
              <Text style={styles.insightText}>
                Start tracking your willpower to see insights here!
              </Text>
            ) : (
              <>
                <Text style={styles.insightText}>
                  • You've successfully resisted temptation {stats.totalCount} times
                </Text>
                <Text style={styles.insightText}>
                  • Your willpower is getting stronger each day
                </Text>
                {stats.streak > 0 && (
                  <Text style={styles.insightText}>
                    • You're on a {stats.streak}-day streak! Keep it up!
                  </Text>
                )}
                {stats.averageDaily > 5 && (
                  <Text style={styles.insightText}>
                    • Excellent consistency! You're building strong habits
                  </Text>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#6C5CE7',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636E72',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  chartContainer: {
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
  },
  insightsContainer: {
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  insightsList: {
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
});

export default StatisticsScreen;