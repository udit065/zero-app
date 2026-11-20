import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { dayScore, toKey, DAY_LABELS, weekdayOf } from '../lib/zero';

const lastNDays = (today, n) => {
  const [y, m, d] = today.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => toKey(new Date(y, m - 1, d - (n - 1 - i))));
};

export default function AnalyticsScreen({ history, today }) {
  const week = lastNDays(today, 7).map((date) => ({
    date,
    score: history[date] ? dayScore(history[date]) : null,
  }));

  // Streak of days that were not a zero (some progress made). Today counts once started.
  let streak = 0;
  for (const date of lastNDays(today, 365).reverse()) {
    const s = history[date] ? dayScore(history[date]) : 0;
    if (s > 0) streak++;
    else if (date !== today) break;
  }

  // Per-goal average over the last 7 days.
  const goals = {};
  week.forEach(({ date }) =>
    (history[date]?.tasks || []).forEach((t) => {
      const g = (goals[t.goal] = goals[t.goal] || { sum: 0, n: 0 });
      g.sum += Math.min(t.count, t.target) / t.target;
      g.n += 1;
    })
  );

  const tracked = week.filter((d) => d.score !== null);
  const weekAvg = tracked.length
    ? tracked.reduce((a, d) => a + d.score, 0) / tracked.length
    : 0;

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.heading}>Analytics</Text>

      <View style={styles.stats}>
        <Stat label="Today" value={pct(history[today] ? dayScore(history[today]) : 0)} />
        <Stat label="7-day avg" value={pct(weekAvg)} />
        <Stat label="No-zero streak" value={`${streak}d`} />
      </View>

      <Text style={styles.sub}>Last 7 days</Text>
      <View style={styles.chart}>
        {week.map(({ date, score }) => (
          <View key={date} style={styles.barCol}>
            <Text style={styles.barValue}>{score === null ? '–' : pct(score)}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${Math.round((score || 0) * 100)}%`,
                    backgroundColor: date === today ? '#4caf50' : '#2e7d32',
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, date === today && { color: '#fff' }]}>
              {DAY_LABELS[weekdayOf(date)]}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sub}>By goal (last 7 days)</Text>
      {Object.entries(goals).map(([name, g]) => {
        const v = g.sum / g.n;
        return (
          <View key={name} style={styles.goalRow}>
            <View style={styles.goalHead}>
              <Text style={styles.goalName}>{name}</Text>
              <Text style={styles.goalPct}>{pct(v)}</Text>
            </View>
            <View style={styles.hTrack}>
              <View style={[styles.hFill, { width: `${Math.round(v * 100)}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const pct = (v) => `${Math.round(v * 100)}%`;

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sub: { color: '#aaa', marginTop: 20, marginBottom: 10 },
  stats: { flexDirection: 'row', marginTop: 12 },
  stat: {
    flex: 1,
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 11, marginTop: 4 },
  chart: {
    flexDirection: 'row',
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 12,
    height: 170,
  },
  barCol: { flex: 1, alignItems: 'center' },
  barValue: { color: '#888', fontSize: 9, marginBottom: 4 },
  barTrack: {
    flex: 1,
    width: 16,
    backgroundColor: '#222',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { color: '#777', fontSize: 11, marginTop: 6 },
  goalRow: { marginBottom: 12 },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  goalName: { color: '#ddd', fontSize: 12, flex: 1 },
  goalPct: { color: '#aaa', fontSize: 12 },
  hTrack: { height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  hFill: { height: '100%', backgroundColor: '#4caf50' },
});
