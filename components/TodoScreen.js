import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { newId } from '../lib/zero';

// Quick everyday to-dos (wash shoes, buy XYZ...).
// They are not part of goals, history or analytics.
// Deleting one removes it completely; no copy is kept anywhere.
export default function TodoScreen({ todos, setTodos }) {
  const [text, setText] = useState('');

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((list) => [{ id: newId(), text: t, done: false }, ...list]);
    setText('');
  };

  const toggle = (id) =>
    setTodos((list) => list.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const remove = (id) => setTodos((list) => list.filter((x) => x.id !== id));

  const clearDone = () => setTodos((list) => list.filter((x) => !x.done));

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.heading}>To-do</Text>
      <Text style={styles.sub}>Quick everyday things. Not tracked anywhere.</Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Wash shoes, buy milk…"
          placeholderTextColor="#555"
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={add} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {todos.length === 0 && <Text style={styles.empty}>Nothing to do. Nice.</Text>}

      {[...open, ...done].map((t) => (
        <View key={t.id} style={styles.item}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => toggle(t.id)}>
            <Text style={[styles.itemText, t.done && styles.itemDone]}>
              {t.done ? '✓ ' : '○ '} {t.text}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => remove(t.id)} hitSlop={10}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {done.length > 0 && (
        <TouchableOpacity onPress={clearDone} style={styles.clearBtn}>
          <Text style={styles.clearText}>Delete {done.length} completed</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sub: { color: '#777', marginBottom: 14, fontSize: 12 },
  addRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#161616',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: '#4caf50',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: { color: '#000', fontWeight: '700' },
  empty: { color: '#555', marginTop: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemText: { color: '#ddd' },
  itemDone: { color: '#4caf50', textDecorationLine: 'line-through' },
  remove: { color: '#777', fontSize: 16, paddingHorizontal: 6 },
  clearBtn: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 6 },
  clearText: { color: '#e57373' },
});
