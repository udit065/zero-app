import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, Card, SectionLabel, Button, Chip, RoundButton, tap } from './ui';
import { colors, space, radius, type } from '../lib/theme';
import { ALL_DAYS, newId, daysBetween, REVIEW_EVERY_DAYS, safeTarget } from '../lib/zero';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];

const sameDays = (a, b) => a.length === b.length && a.every((d) => b.includes(d));

export const describeDays = (days = ALL_DAYS) => {
  if (days.length === 7) return 'Every day';
  if (days.length === 0) return 'Never';
  if (sameDays(days, WEEKDAYS)) return 'Weekdays';
  if (sameDays(days, WEEKENDS)) return 'Weekends';
  if (days.length === 6) return `Except ${DAY_SHORT[ALL_DAYS.find((d) => !days.includes(d))]}`;
  return [...days].sort().map((d) => DAY_SHORT[d]).join(', ');
};

const groupNames = (goal) => [
  ...new Set(goal.tasks.map((t) => (t.group || '').trim()).filter(Boolean)),
];

// Edit your goals and their daily core tasks.
// Changes apply to today and future days; past days keep what they had.
export default function GoalsScreen({ config, setConfig, today, markReviewed }) {
  // { goalId, task, isNew } while the task sheet is open.
  const [editing, setEditing] = useState(null);

  const updateGoal = (goalId, fn) =>
    setConfig((c) => ({ ...c, goals: c.goals.map((g) => (g.id === goalId ? fn(g) : g)) }));

  const addGoal = () => {
    tap();
    setConfig((c) => ({ ...c, goals: [...c.goals, { id: newId(), name: '', tasks: [] }] }));
  };

  const deleteGoal = (g) =>
    Alert.alert('Delete goal?', `"${g.name || 'Untitled goal'}" and all its tasks will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setConfig((c) => ({ ...c, goals: c.goals.filter((x) => x.id !== g.id) })),
      },
    ]);

  const saveTask = (goalId, task) => {
    updateGoal(goalId, (g) => ({
      ...g,
      tasks: g.tasks.some((t) => t.id === task.id)
        ? g.tasks.map((t) => (t.id === task.id ? task : t))
        : [...g.tasks, task],
    }));
    setEditing(null);
  };

  const deleteTask = (goalId, taskId) => {
    updateGoal(goalId, (g) => ({ ...g, tasks: g.tasks.filter((t) => t.id !== taskId) }));
    setEditing(null);
  };

  const sinceReview = daysBetween(config.lastReview || today, today);
  const nextReview = Math.max(0, REVIEW_EVERY_DAYS - sinceReview);

  return (
    <View>
      <ScreenHeader subtitle="Your non-negotiables" title="Goals" />

      <Card style={styles.reviewCard}>
        <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
        <View style={{ flex: 1, marginLeft: space.md }}>
          <Text style={type.body}>
            Reviewed {sinceReview === 0 ? 'today' : `${sinceReview} day${sinceReview > 1 ? 's' : ''} ago`}
          </Text>
          <Text style={type.small}>Next review in {nextReview} days</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            tap();
            markReviewed();
          }}
          style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>Mark reviewed</Text>
        </TouchableOpacity>
      </Card>

      {config.goals.map((g) => (
        <Card key={g.id}>
          <View style={styles.goalHeader}>
            <TextInput
              style={styles.goalName}
              value={g.name}
              onChangeText={(name) => updateGoal(g.id, (x) => ({ ...x, name }))}
              placeholder="Name this goal"
              placeholderTextColor={colors.textFaint}
            />
            <TouchableOpacity onPress={() => deleteGoal(g)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
            </TouchableOpacity>
          </View>

          {g.tasks.length === 0 && (
            <Text style={[type.small, { paddingVertical: space.sm }]}>No tasks yet.</Text>
          )}

          {g.tasks.map((t) => {
            const meta = [
              safeTarget(t.target) > 1 ? `${safeTarget(t.target)} ${t.unit || ''}`.trim() : null,
              describeDays(t.days),
            ].filter(Boolean);
            return (
              <Pressable
                key={t.id}
                onPress={() => {
                  tap();
                  setEditing({ goal: g, task: t, isNew: false });
                }}
                style={({ pressed }) => [styles.taskRow, pressed && { opacity: 0.6 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[type.body, !t.title && { color: colors.textFaint }]}>
                    {t.title || 'Untitled task'}
                  </Text>
                  <View style={[styles.row, { marginTop: 3, flexWrap: 'wrap' }]}>
                    <Text style={type.small}>{meta.join(' · ')}</Text>
                    {!!t.group && (
                      <View style={styles.groupTag}>
                        <Text style={styles.groupTagText}>{t.group} · pick one</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
              </Pressable>
            );
          })}

          <TouchableOpacity
            onPress={() => {
              tap();
              setEditing({
                goal: g,
                isNew: true,
                task: { id: newId(), title: '', target: 1, unit: '', days: ALL_DAYS, group: '' },
              });
            }}
            style={styles.addTask}>
            <Ionicons name="add-circle" size={20} color={colors.accent} />
            <Text style={styles.addTaskText}>Add task</Text>
          </TouchableOpacity>
        </Card>
      ))}

      <Button title="Add goal" icon="add" variant="ghost" onPress={addGoal} style={styles.addGoal} />

      <Text style={[type.small, { textAlign: 'center', marginTop: space.lg }]}>
        Changes apply from today. Past days keep their history.
      </Text>

      {editing && (
        <TaskSheet
          key={editing.task.id}
          editing={editing}
          onClose={() => setEditing(null)}
          onSave={(task) => saveTask(editing.goal.id, task)}
          onDelete={() =>
            Alert.alert('Delete task?', `"${editing.task.title || 'Untitled task'}"`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteTask(editing.goal.id, editing.task.id),
              },
            ])
          }
        />
      )}
    </View>
  );
}

// Bottom sheet for adding / editing one task. Changes apply only on Save.
function TaskSheet({ editing, onClose, onSave, onDelete }) {
  const { goal, isNew } = editing;
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState({
    ...editing.task,
    target: String(editing.task.target ?? 1),
    days: editing.task.days || ALL_DAYS,
    group: editing.task.group || '',
  });
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const target = safeTarget(draft.target);
  const existingGroups = groupNames(goal).filter((n) => n !== draft.group.trim());
  const canSave = draft.title.trim() && draft.days.length > 0;

  const toggleDay = (day) =>
    set({
      days: draft.days.includes(day)
        ? draft.days.filter((d) => d !== day)
        : [...draft.days, day].sort(),
    });

  const save = () =>
    onSave({
      ...draft,
      title: draft.title.trim(),
      target,
      unit: draft.unit.trim(),
      group: draft.group.trim(),
    });

  return (
    <Modal
      transparent
      animationType="slide"
      visible
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={type.caption} numberOfLines={1}>
                {goal.name || 'Goal'}
              </Text>
              <Text style={type.title}>{isNew ? 'New task' : 'Edit task'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <SectionLabel>Task</SectionLabel>
            <TextInput
              style={styles.field}
              value={draft.title}
              onChangeText={(title) => set({ title })}
              placeholder="e.g. Solve DSA questions"
              placeholderTextColor={colors.textFaint}
              autoFocus={isNew}
            />

            <SectionLabel style={styles.gap}>Daily target</SectionLabel>
            <View style={styles.row}>
              <RoundButton
                icon="remove"
                size={40}
                disabled={target <= 1}
                onPress={() => set({ target: String(Math.max(1, target - 1)) })}
              />
              <TextInput
                style={[styles.field, styles.targetField]}
                value={draft.target}
                onChangeText={(v) => set({ target: v.replace(/[^0-9]/g, '') })}
                keyboardType="number-pad"
              />
              <RoundButton icon="add" size={40} onPress={() => set({ target: String(target + 1) })} />
              <TextInput
                style={[styles.field, { flex: 1, marginLeft: space.md }]}
                value={draft.unit}
                onChangeText={(unit) => set({ unit })}
                placeholder="unit: min, pages…"
                placeholderTextColor={colors.textFaint}
              />
            </View>
            <Text style={styles.help}>
              {target > 1
                ? `Log progress with − / +. ${Math.ceil(target / 2)} ${draft.unit || ''} counts as half.`
                : 'A simple done / not done task.'}
            </Text>

            <SectionLabel style={styles.gap}>Repeat on</SectionLabel>
            <View style={styles.row}>
              {DAY_LETTER.map((label, day) => {
                const on = draft.days.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      tap();
                      toggleDay(day);
                    }}
                    style={[styles.dayChip, on && styles.dayOn]}>
                    <Text style={[styles.dayText, on && styles.dayTextOn]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.row, { marginTop: space.sm, flexWrap: 'wrap' }]}>
              <Chip label="Every day" active={draft.days.length === 7} onPress={() => set({ days: ALL_DAYS })} />
              <Chip label="Weekdays" active={sameDays(draft.days, WEEKDAYS)} onPress={() => set({ days: WEEKDAYS })} />
              <Chip label="Weekends" active={sameDays(draft.days, WEEKENDS)} onPress={() => set({ days: WEEKENDS })} />
            </View>

            <SectionLabel style={styles.gap}>Pick-one group (optional)</SectionLabel>
            <TextInput
              style={styles.field}
              value={draft.group}
              onChangeText={(group) => set({ group })}
              placeholder="e.g. Learning"
              placeholderTextColor={colors.textFaint}
            />
            {(existingGroups.length > 0 || !!draft.group) && (
              <View style={[styles.row, { marginTop: space.sm, flexWrap: 'wrap' }]}>
                {existingGroups.map((n) => (
                  <Chip key={n} label={`+ ${n}`} onPress={() => set({ group: n })} />
                ))}
                {!!draft.group && <Chip label="No group" onPress={() => set({ group: '' })} />}
              </View>
            )}
            <Text style={styles.help}>
              Tasks in the same group are alternatives: doing any one completes the group.
            </Text>

            <View style={[styles.row, { marginTop: space.xl, marginBottom: space.lg }]}>
              {!isNew && (
                <Button
                  title="Delete"
                  icon="trash-outline"
                  variant="danger"
                  onPress={onDelete}
                  style={{ marginRight: space.sm }}
                />
              )}
              <Button
                title={isNew ? 'Add task' : 'Save'}
                onPress={() => {
                  tap();
                  save();
                }}
                disabled={!canSave}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  reviewCard: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  smallBtnText: { color: colors.accent, fontSize: 12, fontWeight: '700' },

  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: space.xs },
  goalName: { ...type.heading, flex: 1, paddingVertical: 4, marginRight: space.md },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  groupTag: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: space.sm,
  },
  groupTagText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  addTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  addTaskText: { color: colors.accent, fontWeight: '700', marginLeft: 6 },
  addGoal: { borderStyle: 'dashed', marginTop: space.xs },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: space.md,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: space.lg },
  gap: { marginTop: space.xl },
  field: {
    ...type.body,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.md,
    paddingVertical: 11,
  },
  targetField: { width: 60, textAlign: 'center', marginHorizontal: space.sm, fontWeight: '700' },
  help: { ...type.small, fontSize: 12, marginTop: space.sm },
  dayChip: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 42,
    borderRadius: 21,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  dayOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayText: { color: colors.textMuted, fontWeight: '700' },
  dayTextOn: { color: '#04140a' },
});
