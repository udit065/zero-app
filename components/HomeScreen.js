import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressRing from './ProgressRing';
import { Card, Check, ProgressBar, Stepper, SectionLabel, Button, tap, success } from './ui';
import { colors, space, radius, type, progressColor } from '../lib/theme';
import { dayScore, stepFor, unitsOf, noZeroStreak, taskProgress } from '../lib/zero';
import { quoteOfTheDay } from '../lib/quotes';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const motivation = (score) => {
  if (score >= 1) return 'Day complete. Proud of you.';
  if (score >= 0.75) return 'Almost there. Finish strong.';
  if (score >= 0.4) return 'Good momentum. Keep going.';
  if (score > 0) return 'Good start. One more thing.';
  return 'Everyone starts from zero.';
};

export default function HomeScreen({
  today,
  day,
  history,
  setTaskCount,
  setExtra,
  reviewDue,
  onReview,
  onReviewDismiss,
  openTodos,
  onOpenTodos,
}) {
  const [collapsed, setCollapsed] = useState({});
  const [extraDraft, setExtraDraft] = useState('');

  // Units = single tasks or "pick one" groups; each counts once.
  const units = unitsOf(day);
  const score = dayScore(day);
  const extraSet = !!day.extra.title;
  const total = units.length + (extraSet ? 1 : 0);
  const done =
    units.filter((u) => u.progress >= 1).length + (extraSet && day.extra.done ? 1 : 0);
  const streak = noZeroStreak(history, today);

  // Celebrate the moment the day hits 100%.
  const prevScore = useRef(score);
  useEffect(() => {
    if (prevScore.current < 1 && score >= 1) success();
    prevScore.current = score;
  }, [score]);

  // Group today's units by goal, keeping goal order.
  const goals = [];
  units.forEach((u) => {
    let g = goals.find((x) => x.id === u.goalId);
    if (!g) goals.push((g = { id: u.goalId, name: u.goal, units: [] }));
    g.units.push(u);
  });

  const saveExtra = () => {
    const title = extraDraft.trim();
    if (!title) return;
    tap();
    setExtra({ title, done: false });
    setExtraDraft('');
  };

  const [y, m, d] = today.split('-').map(Number);
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const quote = quoteOfTheDay(today);

  return (
    <View>
      <View style={styles.header}>
        <Text style={type.caption}>{dateLabel}</Text>
        <Text style={type.display}>{greeting()}</Text>
      </View>

      {reviewDue && (
        <Card style={styles.review}>
          <View style={styles.row}>
            <Ionicons name="calendar" size={18} color={colors.warn} />
            <Text style={styles.reviewTitle}>Monthly review</Text>
          </View>
          <Text style={styles.reviewText}>
            It's been a month. Are these tasks still what you need?
          </Text>
          <View style={[styles.row, { marginTop: space.md }]}>
            <Button title="Review goals" onPress={onReview} style={{ flex: 1, marginRight: space.sm }} />
            <Button title="Still good" variant="secondary" onPress={onReviewDismiss} style={{ flex: 1 }} />
          </View>
        </Card>
      )}

      {/* Hero: today's progress */}
      <Card style={styles.hero}>
        <ProgressRing
          progress={score * 100}
          size={112}
          strokeWidth={11}
          sublabel={`${done} of ${total}`}
        />
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{motivation(score)}</Text>
          <View style={[styles.pill, streak > 0 && styles.pillActive]}>
            <Ionicons
              name="flame"
              size={14}
              color={streak > 0 ? colors.warn : colors.textFaint}
            />
            <Text style={[styles.pillText, streak > 0 && { color: colors.warn }]}>
              {streak > 0 ? `${streak}-day no-zero streak` : 'No streak yet'}
            </Text>
          </View>
        </View>
      </Card>

      {goals.length === 0 && (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="bed-outline" size={28} color={colors.textMuted} />
          <Text style={[type.heading, { marginTop: space.sm }]}>Rest day</Text>
          <Text style={type.small}>No core tasks scheduled today.</Text>
        </Card>
      )}

      {goals.map((g) => {
        const gProgress = g.units.reduce((a, u) => a + u.progress, 0) / g.units.length;
        const isCollapsed = collapsed[g.id];
        return (
          <Card key={g.id} style={styles.goalCard}>
            <Pressable
              onPress={() => {
                tap();
                setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }));
              }}
              style={styles.goalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalName} numberOfLines={1}>
                  {g.name}
                </Text>
                <View style={[styles.row, { marginTop: 8 }]}>
                  <ProgressBar value={gProgress} height={5} color={colors.accent} />
                  <Text style={[styles.goalPct, { color: progressColor(gProgress) }]}>
                    {Math.round(gProgress * 100)}%
                  </Text>
                </View>
              </View>
              <Ionicons
                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                size={18}
                color={colors.textFaint}
                style={{ marginLeft: space.md }}
              />
            </Pressable>

            {!isCollapsed &&
              g.units.map((u) =>
                u.group && u.tasks.length > 1 ? (
                  <PickOneGroup key={u.key} unit={u} setTaskCount={setTaskCount} />
                ) : (
                  <TaskRow key={u.key} task={u.tasks[0]} setTaskCount={setTaskCount} />
                )
              )}
          </Card>
        );
      })}

      {/* One flexible task per day */}
      <Card>
        <SectionLabel>Today I'll also…</SectionLabel>
        {extraSet ? (
          <Pressable
            style={styles.taskRow}
            onPress={() => {
              tap();
              setExtra({ ...day.extra, done: !day.extra.done });
            }}>
            <Check progress={day.extra.done ? 1 : 0} />
            <Text style={[styles.taskTitle, day.extra.done && styles.doneText]}>
              {day.extra.title}
            </Text>
            <TouchableOpacity
              hitSlop={10}
              onPress={() => setExtra({ title: '', done: false })}>
              <Ionicons name="close" size={18} color={colors.textFaint} />
            </TouchableOpacity>
          </Pressable>
        ) : (
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="One more thing for today"
              placeholderTextColor={colors.textFaint}
              value={extraDraft}
              onChangeText={setExtraDraft}
              onSubmitEditing={saveExtra}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={saveExtra}
              style={[styles.addBtn, !extraDraft.trim() && { opacity: 0.4 }]}>
              <Ionicons name="add" size={22} color="#04140a" />
            </TouchableOpacity>
          </View>
        )}
      </Card>

      {openTodos > 0 && (
        <Pressable onPress={onOpenTodos}>
          <Card style={[styles.row, { paddingVertical: space.md }]}>
            <Ionicons name="checkbox-outline" size={20} color={colors.textMuted} />
            <Text style={[type.body, { flex: 1, marginLeft: space.md }]}>
              {openTodos} open to-do{openTodos > 1 ? 's' : ''}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Card>
        </Pressable>
      )}

      <View style={styles.quote}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.accent} />
        <Text style={styles.quoteText}>“{quote.text}”</Text>
      </View>
    </View>
  );
}

// A "pick one" group: doing any one option completes it.
function PickOneGroup({ unit, setTaskCount }) {
  const full = unit.progress >= 1;
  const chosen = unit.tasks.find((t) => t.count >= t.target);

  return (
    <View style={[styles.pickGroup, full && { borderColor: 'rgba(76,199,100,0.35)' }]}>
      <View style={styles.pickHeader}>
        <Text style={[styles.pickTitle, { color: progressColor(unit.progress) }]}>
          {unit.group}
        </Text>
        <Text style={styles.pickHint}>
          {full ? `✓ done via ${chosen.title}` : 'pick any one'}
        </Text>
      </View>
      {unit.tasks.map((t, i) => (
        <View key={t.id}>
          {i > 0 && (
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>
          )}
          <TaskRow task={t} setTaskCount={setTaskCount} dim={full && t !== chosen} nested />
        </View>
      ))}
    </View>
  );
}

function TaskRow({ task, setTaskCount, dim, nested }) {
  const p = taskProgress(task);
  const full = p >= 1;

  return (
    <Pressable
      // Tapping the row marks it fully done / undone.
      onPress={() => {
        tap();
        setTaskCount(task.id, full ? 0 : task.target);
      }}
      style={[styles.taskRow, nested && styles.nestedRow, dim && { opacity: 0.4 }]}>
      <Check progress={p} />
      <View style={{ flex: 1, marginLeft: space.md }}>
        <Text style={[styles.taskTitle, { marginLeft: 0 }, full && styles.doneText]}>
          {task.title}
        </Text>
        {task.target > 1 && (
          <Text style={styles.taskSub}>
            Goal: {task.target}
            {task.unit ? ` ${task.unit}` : ''}
          </Text>
        )}
      </View>
      {task.target > 1 && (
        <Stepper
          value={task.count}
          target={task.target}
          unit=""
          step={stepFor(task.target)}
          onChange={(v) => setTaskCount(task.id, v)}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: space.sm, marginBottom: space.lg },
  row: { flexDirection: 'row', alignItems: 'center' },

  review: { backgroundColor: colors.warnSoft, borderColor: 'rgba(232,163,61,0.35)' },
  reviewTitle: { ...type.heading, color: colors.warn, marginLeft: space.sm },
  reviewText: { ...type.small, color: '#e8cf9f', marginTop: space.xs },

  hero: { flexDirection: 'row', alignItems: 'center', padding: space.xl },
  heroText: { flex: 1, marginLeft: space.xl },
  heroTitle: { ...type.title, fontSize: 18, lineHeight: 24 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: space.md,
  },
  pillActive: { backgroundColor: colors.warnSoft },
  pillText: { color: colors.textFaint, fontSize: 12, fontWeight: '700', marginLeft: 5 },

  goalCard: { paddingBottom: space.sm },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  goalName: { ...type.heading, fontSize: 15 },
  goalPct: { fontSize: 12, fontWeight: '700', marginLeft: space.sm, width: 38, textAlign: 'right' },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  nestedRow: { borderTopWidth: 0, paddingVertical: 8 },
  taskTitle: { ...type.body, flex: 1, marginLeft: space.md },
  taskSub: { ...type.small, fontSize: 12, marginTop: 2 },
  doneText: { color: colors.textMuted, textDecorationLine: 'line-through' },

  pickGroup: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginVertical: space.sm,
    backgroundColor: colors.bg,
  },
  pickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pickTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  pickHint: { color: colors.textMuted, fontSize: 11, flexShrink: 1, marginLeft: space.sm },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  orText: { color: colors.textFaint, fontSize: 10, fontWeight: '800', marginHorizontal: space.sm },

  input: {
    flex: 1,
    ...type.body,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.md,
    paddingVertical: 10,
  },
  addBtn: {
    marginLeft: space.sm,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quote: {
    flexDirection: 'row',
    paddingHorizontal: space.sm,
    paddingTop: space.md,
  },
  quoteText: {
    ...type.small,
    fontStyle: 'italic',
    flex: 1,
    marginLeft: space.sm,
    lineHeight: 19,
  },
});
