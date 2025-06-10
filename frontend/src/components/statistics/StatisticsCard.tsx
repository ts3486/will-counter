import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatisticsCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  subtitle,
  color,
}) => {
  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#636E72',
  },
});

export default StatisticsCard;