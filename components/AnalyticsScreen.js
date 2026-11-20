import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, SectionLabel, ProgressBar } from './ui';
import { colors, space, radius, type } from '../lib/theme';
import { dayScore, DAY_LABELS, weekdayOf, unitsOf, lastNDays, noZeroStreak } from '../lib/zero';

const pct = (v) => `${Math.round(v * 100)}%`;

export default function AnalyticsScreen({ history, today }) {
  const week = lastNDays(today, 7).map((date) => ({
    date,
    score: history[date] ? dayScore(history[date]) : null,
  }));
  const streak = noZeroStreak(history, today);

  const tracked = week.filter((d) => d.score !== null);
  const weekAvg = tracked.length ? tracked.reduce((a, d) => a + d.score, 0) / tracked.length : 0;
  const perfectDays = Object.values(history).filter((d) => dayScore(d) >= 1).length;

  // Per-goal average over the last 7 days (groups count once).
  const goals = {};
  week.forEach(({ date }) =>
    unitsOf(history[date]).forEach((u) => {
      const g = (goals[u.goal] = goals[u.goal] || { sum: 0, n: 0 });
      g.sum += u.progress;
      g.n += 1;
    })
  );
  const goalRows = Object.entries(goals)
    .map(([name, g]) => ({ name, v: g.sum / g.n }))
    .sort((a, b) => b.v - a.v);

  // Last 5 weeks as a heatmap, oldest first.
  const heat = lastNDays(today, 35).map((date) => ({
    date,
    score: history[date] ? dayScore(history[date]) : null,
  }));

  return (
    <View>
      <ScreenHeader subtitle="Your consistency" title="Stats" />

      <View style={styles.stats}>
        <Stat icon="today-outline" label="Today" value={pct(history[today] ? dayScore(history[today]) : 0)} />
        <Stat icon="trending-up" label="7-day avg" value={pct(weekAvg)} />
        <Stat icon="flame" label="Streak" value={`${streak}d`} accent={streak > 0} />
        <Stat icon="trophy-outline" label="100% days" value={String(perfectDays)} />
      </View>

      <Card>
        <SectionLabel>Last 7 days</SectionLabel>
        <View style={styles.chart}>
          {week.map(({ date, score }) => {
            const isToday = date === today;
            return (
              <View key={date} style={styles.barCol}>
                <Text style={styles.barValue}>{score === null ? '' : pct(score)}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max(score ? 4 : 0, Math.round((score || 0) * 100))}%`,
                        backgroundColor: isToday ? colors.accent : colors.accentDark,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                  {DAY_LABELS[weekdayOf(date)]}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <SectionLabel>Last 5 weeks</SectionLabel>
        <View style={styles.heat}>
          {heat.map(({ date, score }) => (
            <View
              key={date}
              style={[
                styles.heatCell,
                {
                  backgroundColor:
                    score === null || score === 0
                      ? colors.surfaceHigh
                      : `rgba(76, 199, 100, ${0.25 + score * 0.75})`,
                },
                date === today && styles.heatToday,
              ]}
            />
          ))}
        </View>
        <View style={styles.legend}>
          <Text style={type.small}>Less</Text>
          {[0, 0.33, 0.66, 1].map((v) => (
            <View
              key={v}
              style={[
                styles.legendCell,
                { backgroundColor: v === 0 ? colors.surfaceHigh : `rgba(76, 199, 100, ${0.25 + v * 0.75})` },
              ]}
            />
          ))}
          <Text style={type.small}>More</Text>
        </View>
      </Card>

      <Card>
        <SectionLabel>By goal · last 7 days</SectionLabel>
        {goalRows.length === 0 && <Text style={type.small}>No data yet.</Text>}
        {goalRows.map(({ name, v }) => (
          <View key={name} style={styles.goalRow}>
            <View style={styles.goalHead}>
              <Text style={styles.goalName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.goalPct}>{pct(v)}</Text>
            </View>
            <ProgressBar value={v} height={8} color={colors.accent} />
          </View>
        ))}
      </Card>
    </View>
  );
}

function Stat({ icon, label, value, accent }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={accent ? colors.warn : colors.textMuted} />
      <Text style={[styles.statValue, accent && { color: colors.warn }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', marginBottom: space.md, marginHorizontal: -space.xs },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: space.md,
    marginHorizontal: space.xs,
    alignItems: 'center',
  },
  statValue: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 6 },
  statLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2, fontWeight: '600' },

  chart: { flexDirection: 'row', height: 150 },
  barCol: { flex: 1, alignItems: 'center' },
  barValue: { color: colors.textMuted, fontSize: 9, marginBottom: 4, height: 12 },
  barTrack: {
    flex: 1,
    width: 18,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 9,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 9 },
  barLabel: { color: colors.textFaint, fontSize: 11, marginTop: 6, fontWeight: '600' },
  barLabelToday: { color: colors.accent, fontWeight: '800' },

  heat: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  heatCell: { width: `${100 / 7}%`, aspectRatio: 1, borderRadius: 6, borderWidth: 3, borderColor: colors.surface },
  heatToday: { borderColor: colors.text, borderWidth: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: space.sm },
  legendCell: { width: 12, height: 12, borderRadius: 3, marginHorizontal: 3 },

  goalRow: { marginBottom: space.md },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalName: { ...type.body, fontSize: 13, flex: 1, marginRight: space.sm },
  goalPct: { color: colors.text, fontSize: 13, fontWeight: '700' },
});
