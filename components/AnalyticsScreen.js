import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AnalyticsScreen({ weeklyScore, completedTasks, totalTasks }) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.heading}>Analytics</Text>

      <Text style={styles.box}>
        Today: {completedTasks}/{totalTasks}
      </Text>

      <Text style={styles.sub}>Last 7 Days</Text>

      {weeklyScore.map(day => (
        <Text key={day.date} style={styles.item}>
          {day.date} → {day.done}/{day.total}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sub: { color: '#aaa', marginTop: 10 },
  item: { color: '#ccc', fontSize: 12 },
  box: {
    backgroundColor: '#1c1c1c',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    color: '#fff',
  },
});