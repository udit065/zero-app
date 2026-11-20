import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import ProgressRing from './ProgressRing';
import { dayScore, stepFor } from '../lib/zero';

export default function HomeScreen({
  day,
  expanded,
  toggleCategory,
  setTaskCount,
  setExtra,
  reviewDue,
  onReview,
  onReviewDismiss,
}) {
  const [extraDraft, setExtraDraft] = useState('');

  const doneCount = day.tasks.filter((t) => t.count >= t.target).length;
  const extraSet = !!day.extra.title;
  const total = day.tasks.length + (extraSet ? 1 : 0);
  const done = doneCount + (extraSet && day.extra.done ? 1 : 0);

  // Group today's tasks by goal, keeping goal order.
  const groups = [];
  day.tasks.forEach((t) => {
    let g = groups.find((x) => x.id === t.goalId);
    if (!g) groups.push((g = { id: t.goalId, name: t.goal, tasks: [] }));
    g.tasks.push(t);
  });

  const saveExtra = () => {
    const title = extraDraft.trim();
    if (!title) return;
    setExtra({ title, done: false });
    setExtraDraft('');
  };

  return (
    <View style={{ padding: 16 }}>
      {reviewDue && (
        <View style={styles.review}>
          <Text style={styles.reviewText}>
            Monthly review: are these tasks still what you need?
          </Text>
          <View style={styles.reviewRow}>
            <TouchableOpacity onPress={onReview} style={styles.reviewBtn}>
              <Text style={styles.reviewBtnText}>Review goals</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onReviewDismiss} style={styles.reviewBtn}>
              <Text style={styles.reviewBtnText}>Still good</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.topSection}>
        <View>
          <Text style={styles.heading}>Today's Focus</Text>
          <Text style={styles.sub}>
            {done}/{total} Tasks Completed
          </Text>
        </View>
        <ProgressRing progress={dayScore(day) * 100} />
      </View>

      {groups.length === 0 && (
        <Text style={styles.sub}>No tasks scheduled today. Rest day.</Text>
      )}

      {groups.map((g) => {
        const gDone = g.tasks.filter((t) => t.count >= t.target).length;
        return (
          <View key={g.id} style={styles.card}>
            <TouchableOpacity style={styles.header} onPress={() => toggleCategory(g.id)}>
              <Text style={styles.title}>{g.name}</Text>
              <Text style={styles.icon}>
                {gDone}/{g.tasks.length} {expanded[g.id] ? '⌃' : '⌄'}
              </Text>
            </TouchableOpacity>

            {expanded[g.id] &&
              g.tasks.map((t) => (
                <TaskRow key={t.id} task={t} setTaskCount={setTaskCount} />
              ))}
          </View>
        );
      })}

      {/* One flexible task per day */}
      <View style={[styles.card, styles.extraCard]}>
        <Text style={styles.extraLabel}>Today I'll also…</Text>
        {extraSet ? (
          <View style={styles.extraRow}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setExtra({ ...day.extra, done: !day.extra.done })}>
              <Text style={{ color: day.extra.done ? '#4caf50' : '#ddd' }}>
                {day.extra.done ? '✓ ' : '○ '} {day.extra.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setExtra({ title: '', done: false })}>
              <Text style={styles.remove}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.extraRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Fix the login bug"
              placeholderTextColor="#555"
              value={extraDraft}
              onChangeText={setExtraDraft}
              onSubmitEditing={saveExtra}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={saveExtra} style={styles.setBtn}>
              <Text style={styles.setBtnText}>Set</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function TaskRow({ task, setTaskCount }) {
  const full = task.count >= task.target;
  const partial = task.count > 0 && !full;
  const color = full ? '#4caf50' : partial ? '#e0a030' : '#ddd';
  const step = stepFor(task.target);

  return (
    <View style={styles.task}>
      {/* Tapping the title marks it fully done / undone */}
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => setTaskCount(task.id, full ? 0 : task.target)}>
        <Text style={{ color }}>
          {full ? '✓ ' : partial ? '◐ ' : '○ '} {task.title}
        </Text>
      </TouchableOpacity>

      {task.target > 1 && (
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => setTaskCount(task.id, task.count - step)}
            style={styles.stepBtn}>
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.count, { color }]}>
            {task.count}/{task.target}
            {task.unit ? ` ${task.unit}` : ''}
          </Text>
          <TouchableOpacity
            onPress={() => setTaskCount(task.id, task.count + step)}
            style={styles.stepBtn}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sub: { color: '#888', marginBottom: 10 },
  card: { backgroundColor: '#161616', borderRadius: 12, marginTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  title: { color: '#fff', flex: 1 },
  icon: { color: '#aaa' },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: '#fff', fontSize: 16 },
  count: { fontSize: 12, marginHorizontal: 8, minWidth: 60, textAlign: 'center' },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  extraCard: { padding: 12, borderLeftWidth: 3, borderLeftColor: '#4caf50' },
  extraLabel: { color: '#aaa', fontSize: 12, marginBottom: 8 },
  extraRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  setBtn: {
    marginLeft: 8,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  setBtnText: { color: '#000', fontWeight: '700' },
  remove: { color: '#777', fontSize: 16, paddingHorizontal: 8 },
  review: {
    backgroundColor: '#1f1a0d',
    borderColor: '#e0a030',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  reviewText: { color: '#f0d090', marginBottom: 10 },
  reviewRow: { flexDirection: 'row' },
  reviewBtn: {
    backgroundColor: '#2a2414',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  reviewBtnText: { color: '#f0d090', fontWeight: '600' },
});
