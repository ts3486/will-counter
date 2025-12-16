import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../shared/GradientBackground';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';
import { getMaxContentWidth, getResponsivePadding } from '../../utils/responsive';
import { apiService, DailyStat } from '../../services/api';

type Summary = {
  today: number;
  total: number;
  weeklyAverage: number;
};

const HistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const dimensions = useResponsiveDimensions();
  const [history, setHistory] = useState<DailyStat[]>([]);
  const [summary, setSummary] = useState<Summary>({ today: 0, total: 0, weeklyAverage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await apiService.getStatistics(14);
      const sorted = [...(stats.daily_counts || [])].sort(
        (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
      );
      setHistory(sorted);
      setSummary({
        today: stats.today_count,
        total: stats.total_count,
        weeklyAverage: stats.weekly_average,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const recentHistory = useMemo(() => {
    if (!history.length) return [];
    return history.slice(-7);
  }, [history]);

  const padding = getResponsivePadding(dimensions);
  const maxWidth = getMaxContentWidth(dimensions);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: padding,
              maxWidth,
              alignSelf: 'center',
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchHistory}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#101418' }]}>History</Text>
            {error && (
              <Text style={[styles.errorText, { color: theme.colors.status.error }]}>
                {error}
              </Text>
            )}
          </View>

          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.surface.elevated,
                  borderColor: theme.colors.border.light,
                },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: '#101418' }]}>Today</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {summary.today}
              </Text>
              <Text style={[styles.summaryHint, { color: theme.colors.text.secondary }]}>
                Collected so far
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.surface.elevated,
                  borderColor: theme.colors.border.light,
                },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: '#101418' }]}>Last 14 days</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
                {summary.total}
              </Text>
              <Text style={[styles.summaryHint, { color: theme.colors.text.secondary }]}>
                Avg {summary.weeklyAverage.toFixed(1)} / day
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface.primary,
                borderColor: theme.colors.border.light,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: '#101418' }]}>Trend</Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.text.secondary }]}>
                Last 7 days
              </Text>
            </View>
            <HistoryChart
              data={recentHistory}
              accent={theme.colors.primary}
              textColor={theme.colors.text.secondary}
            />
            {loading && !recentHistory.length && (
              <Text style={[styles.helperText, { color: theme.colors.text.secondary }]}>
                Fetching your history...
              </Text>
            )}
            {!loading && !recentHistory.length && (
              <Text style={[styles.helperText, { color: theme.colors.text.secondary }]}>
                Start tapping the counter to see your history here.
              </Text>
            )}
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface.primary,
                borderColor: theme.colors.border.light,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: '#101418' }]}>Recent log</Text>
            </View>
            {history
              .slice(-14)
              .reverse()
              .map((entry) => (
                <View
                  key={entry.date}
                  style={[
                    styles.historyRow,
                    {
                      borderColor: theme.colors.border.light,
                    },
                  ]}
                >
                  <View>
                    <Text style={[styles.historyDate, { color: '#101418' }]}>
                      {formatFullDate(entry.date)}
                    </Text>
                    <Text style={[styles.historyMeta, { color: theme.colors.text.secondary }]}>
                      {entry.sessions} session{entry.sessions === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.countPill,
                      { backgroundColor: theme.colors.background.mid },
                    ]}
                  >
                    <Text style={[styles.countText, { color: theme.colors.text.primary }]}>
                      {entry.count}
                    </Text>
                  </View>
                </View>
              ))}
            {!history.length && !loading && (
              <Text style={[styles.helperText, { color: theme.colors.text.secondary }]}>
                No history yet. Come back after a few taps.
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const HistoryChart: React.FC<{
  data: DailyStat[];
  accent: string;
  textColor: string;
}> = ({ data, accent, textColor }) => {
  if (!data.length) {
    return null;
  }

  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((item) => {
          const heightRatio = item.count / maxCount;
          const barHeight = Math.max(12, heightRatio * 140);
          return (
            <View key={item.date} style={styles.barWrapper}>
              <Text style={[styles.barValue, { color: textColor }]}>{item.count}</Text>
              <View style={[styles.bar, { height: barHeight, backgroundColor: accent }]} />
              <Text style={[styles.barLabel, { color: textColor }]}>
                {formatShortLabel(item.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const parseDate = (date: string) => new Date(`${date}T00:00:00Z`);

const formatShortLabel = (date: string) => {
  const parsed = parseDate(date);
  return parsed.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatFullDate = (date: string) => {
  const parsed = parseDate(date);
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: 'rgba(16, 20, 24, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  summaryHint: {
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: 'rgba(16, 20, 24, 0.18)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  chartContainer: {
    borderRadius: 14,
    paddingVertical: 8,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    gap: 8,
    paddingHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: 26,
    borderRadius: 10,
    marginVertical: 6,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  countPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  helperText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default HistoryScreen;
