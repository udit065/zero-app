import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Check, SectionLabel, EmptyState, tap } from './ui';
import { colors, space, radius, type } from '../lib/theme';
import { newId } from '../lib/zero';

// Quick everyday to-dos (wash shoes, buy XYZ...).
// They are not part of goals, history or analytics.
// Deleting one removes it completely; no copy is kept anywhere.
export default function TodoScreen({ todos, setTodos }) {
  const [text, setText] = useState('');

  const add = () => {
    const t = text.trim();
    if (!t) return;
    tap();
    setTodos((list) => [{ id: newId(), text: t, done: false }, ...list]);
    setText('');
  };

  const toggle = (id) => {
    tap();
    setTodos((list) => list.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  const remove = (id) => {
    tap();
    setTodos((list) => list.filter((x) => x.id !== id));
  };

  const clearDone = () => {
    tap();
    setTodos((list) => list.filter((x) => !x.done));
  };

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <View>
      <ScreenHeader
        subtitle={open.length ? `${open.length} open` : 'All clear'}
        title="To-do"
      />

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Wash shoes, buy milk…"
          placeholderTextColor={colors.textFaint}
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={add}
          style={[styles.addBtn, !text.trim() && { opacity: 0.4 }]}>
          <Ionicons name="add" size={24} color="#04140a" />
        </TouchableOpacity>
      </View>

      {todos.length === 0 && (
        <EmptyState
          icon="sparkles-outline"
          title="Nothing to do"
          text="Add quick everyday things here. They're not tracked anywhere, and deleting one removes it for good."
        />
      )}

      {open.length > 0 && (
        <Card style={styles.list}>
          {open.map((t, i) => (
            <TodoRow key={t.id} todo={t} first={i === 0} onToggle={toggle} onRemove={remove} />
          ))}
        </Card>
      )}

      {done.length > 0 && (
        <>
          <View style={styles.doneHeader}>
            <SectionLabel style={{ marginBottom: 0 }}>Completed · {done.length}</SectionLabel>
            <TouchableOpacity onPress={clearDone} hitSlop={8}>
              <Text style={styles.clear}>Delete all</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.list}>
            {done.map((t, i) => (
              <TodoRow key={t.id} todo={t} first={i === 0} onToggle={toggle} onRemove={remove} />
            ))}
          </Card>
        </>
      )}
    </View>
  );
}

function TodoRow({ todo, first, onToggle, onRemove }) {
  return (
    <Pressable onPress={() => onToggle(todo.id)} style={[styles.item, !first && styles.divider]}>
      <Check progress={todo.done ? 1 : 0} size={22} />
      <Text style={[styles.itemText, todo.done && styles.itemDone]}>{todo.text}</Text>
      <TouchableOpacity onPress={() => onRemove(todo.id)} hitSlop={10} style={styles.trash}>
        <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space.lg },
  input: {
    flex: 1,
    ...type.body,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.lg,
    paddingVertical: 13,
  },
  addBtn: {
    marginLeft: space.sm,
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingVertical: space.xs },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  itemText: { ...type.body, flex: 1, marginLeft: space.md },
  itemDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  trash: { paddingLeft: space.sm },
  doneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.sm,
    marginBottom: space.sm,
  },
  clear: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
