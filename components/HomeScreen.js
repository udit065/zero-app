import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressRing from './ProgressRing';

export default function HomeScreen({
  tasks,
  expanded,
  toggleTask,
  toggleCategory,
  completedTasks,
  totalTasks
}) {
  return (
    <View style={{ padding: 16 }}>
    <View style={styles.topSection}>
  
  <View>
    <Text style={styles.heading}>Today's Focus</Text>
    <Text style={styles.sub}>
      {completedTasks}/{totalTasks} Tasks Completed
    </Text>
  </View>

  <ProgressRing
    progress={
      totalTasks === 0
        ? 0
        : (completedTasks / totalTasks) * 100
    }
  />

</View>

      {Object.keys(tasks).map(category => (
        <View key={category} style={styles.card}>

          <TouchableOpacity
            style={styles.header}
            onPress={() => toggleCategory(category)}
          >
            <Text style={styles.title}>{category}</Text>
            <Text style={styles.icon}>
              {expanded[category] ? '⌃' : '⌄'}
            </Text>
          </TouchableOpacity>

          {expanded[category] &&
            tasks[category].map(task => (
              <TouchableOpacity
                key={task.id}
                style={styles.task}
                onPress={() => toggleTask(category, task.id)}
              >
                <Text style={{ color: task.done ? '#4caf50' : '#ddd' }}>
                  {task.done ? '✓ ' : '○ '} {task.title}
                </Text>
              </TouchableOpacity>
            ))
          }

        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sub: { color: '#888', marginBottom: 10 },
  card: {
    backgroundColor: '#161616',
    borderRadius: 12,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  title: { color: '#fff' },
  icon: { color: '#aaa' },
  task: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  topSection: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
},

});