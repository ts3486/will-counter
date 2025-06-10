import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserStatistics } from '../../../../shared/types/database';

interface StatisticsChartProps {
  data: UserStatistics[];
  width: number;
  height: number;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ data, width, height }) => {
  if (!data.length) {
    return (
      <View style={[styles.emptyContainer, { width, height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const chartWidth = width - 40; // Padding
  const chartHeight = height - 60; // Padding for labels

  const renderBars = () => {
    if (maxCount === 0) return null;

    const barWidth = chartWidth / data.length;
    const maxBarHeight = chartHeight - 20;

    return data.map((stat, index) => {
      const barHeight = (stat.count / maxCount) * maxBarHeight;
      const x = index * barWidth;
      const y = chartHeight - barHeight - 20;

      return (
        <View key={stat.date} style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                width: Math.max(barWidth - 4, 8),
                height: Math.max(barHeight, 2),
                left: x + 2,
                bottom: 20,
                backgroundColor: stat.count > 0 ? '#6C5CE7' : '#E8E8E8',
              },
            ]}
          />
          <Text
            style={[
              styles.barLabel,
              {
                left: x,
                width: barWidth,
                bottom: 0,
              },
            ]}
          >
            {new Date(stat.date).getDate()}
          </Text>
          {stat.count > 0 && (
            <Text
              style={[
                styles.barValue,
                {
                  left: x,
                  width: barWidth,
                  bottom: barHeight + 25,
                },
              ]}
            >
              {stat.count}
            </Text>
          )}
        </View>
      );
    });
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.chartContainer}>
        {renderBars()}
      </View>
      <View style={styles.axisContainer}>
        <Text style={styles.axisLabel}>Days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#636E72',
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
  },
  barContainer: {
    position: 'absolute',
    bottom: 0,
    top: 0,
  },
  bar: {
    position: 'absolute',
    borderRadius: 2,
  },
  barLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#636E72',
    textAlign: 'center',
  },
  barValue: {
    position: 'absolute',
    fontSize: 10,
    color: '#2D3436',
    textAlign: 'center',
    fontWeight: '600',
  },
  axisContainer: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  axisLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
});

export default StatisticsChart;