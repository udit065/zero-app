import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DAY_LABELS, ALL_DAYS, newId, daysBetween, REVIEW_EVERY_DAYS } from '../lib/zero';

// Edit your goals and their daily core tasks.
// Changes apply to today and future days; past days keep what they had.
export default function GoalsScreen({ config, setConfig, today, markReviewed }) {
  const updateGoal = (goalId, fn) =>
    setConfig((c) => ({
      ...c,
      goals: c.goals.map((g) => (g.id === goalId ? fn(g) : g)),
    }));

  const updateTask = (goalId, taskId, patch) =>
    updateGoal(goalId, (g) => ({
      ...g,
      tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
    }));

  const addGoal = () =>
    setConfig((c) => ({
      ...c,
      goals: [...c.goals, { id: newId(), name: 'New goal', tasks: [] }],
    }));

  const addTask = (goalId) =>
    updateGoal(goalId, (g) => ({
      ...g,
      tasks: [
        ...g.tasks,
        { id: newId(), title: '', target: 1, unit: '', days: ALL_DAYS },
      ],
    }));

  const confirm = (message, onYes) =>
    Alert.alert('Are you sure?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onYes },
    ]);

  const deleteGoal = (g) =>
    confirm(`Delete "${g.name}" and all its tasks?`, () =>
      setConfig((c) => ({ ...c, goals: c.goals.filter((x) => x.id !== g.id) }))
    );

  const deleteTask = (goalId, t) =>
    confirm(`Delete "${t.title || 'this task'}"?`, () =>
      updateGoal(goalId, (g) => ({
        ...g,
        tasks: g.tasks.filter((x) => x.id !== t.id),
      }))
    );

  const toggleDay = (goalId, t, day) => {
    const days = t.days || ALL_DAYS;
    const next = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day].sort();
    updateTask(goalId, t.id, { days: next });
  };

  const sinceReview = daysBetween(config.lastReview || today, today);

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.heading}>Goals & core tasks</Text>
      <Text style={styles.sub}>
        Your non-negotiables. Change them on purpose, not on a lazy day.
      </Text>

      <View style={styles.reviewBox}>
        <Text style={styles.reviewText}>
          Last review: {sinceReview === 0 ? 'today' : `${sinceReview} days ago`}
          {'  ·  '}next in {Math.max(0, REVIEW_EVERY_DAYS - sinceReview)} days
        </Text>
        <TouchableOpacity onPress={markReviewed}>
          <Text style={styles.link}>Mark reviewed</Text>
        </TouchableOpacity>
      </View>

      {config.goals.map((g) => (
        <View key={g.id} style={styles.card}>
          <View style={styles.goalRow}>
            <TextInput
              style={styles.goalName}
              value={g.name}
              onChangeText={(name) => updateGoal(g.id, (x) => ({ ...x, name }))}
              placeholder="Goal name"
              placeholderTextColor="#555"
            />
            <TouchableOpacity onPress={() => deleteGoal(g)} hitSlop={10}>
              <Text style={styles.remove}>✕</Text>
            </TouchableOpacity>
          </View>

          {g.tasks.map((t) => (
            <View key={t.id} style={styles.task}>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={t.title}
                  onChangeText={(title) => updateTask(g.id, t.id, { title })}
                  placeholder="Task (e.g. Solve DSA questions)"
                  placeholderTextColor="#555"
                />
                <TouchableOpacity onPress={() => deleteTask(g.id, t)} hitSlop={10}>
                  <Text style={styles.remove}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.row, { marginTop: 8 }]}>
                <Text style={styles.label}>Target</Text>
                <TextInput
                  style={[styles.input, styles.small]}
                  value={String(t.target)}
                  onChangeText={(v) =>
                    updateTask(g.id, t.id, { target: v.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                />
                <TextInput
                  style={[styles.input, styles.unit]}
                  value={t.unit}
                  onChangeText={(unit) => updateTask(g.id, t.id, { unit })}
                  placeholder="unit (min, pages)"
                  placeholderTextColor="#555"
                />
              </View>

              <View style={[styles.row, { marginTop: 8 }]}>
                {DAY_LABELS.map((label, day) => {
                  const on = (t.days || ALL_DAYS).includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => toggleDay(g.id, t, day)}
                      style={[styles.dayChip, on && styles.dayOn]}>
                      <Text style={[styles.dayText, on && styles.dayTextOn]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={() => addTask(g.id)} style={styles.addTask}>
            <Text style={styles.link}>+ Add task</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addGoal} style={styles.addGoal}>
        <Text style={styles.addGoalText}>+ Add goal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sub: { color: '#777', fontSize: 12, marginBottom: 12 },
  reviewBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  reviewText: { color: '#aaa', fontSize: 12, flex: 1 },
  link: { color: '#4caf50', fontWeight: '600' },
  card: { backgroundColor: '#161616', borderRadius: 12, marginTop: 10, padding: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  goalName: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700', paddingVertical: 4 },
  task: { borderTopWidth: 1, borderTopColor: '#222', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    color: '#fff',
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  small: { width: 56, textAlign: 'center', marginHorizontal: 8 },
  unit: { flex: 1 },
  label: { color: '#888', fontSize: 12 },
  remove: { color: '#777', fontSize: 16, paddingHorizontal: 8 },
  dayChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  dayOn: { backgroundColor: '#4caf50' },
  dayText: { color: '#666', fontSize: 12 },
  dayTextOn: { color: '#000', fontWeight: '700' },
  addTask: { paddingTop: 8 },
  addGoal: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addGoalText: { color: '#aaa', fontWeight: '600' },
});
