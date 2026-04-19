import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './components/HomeScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import GoalsScreen from './components/GoalsScreen';
import QuotesScreen from './components/QuotesScreen';

const getToday = () => new Date().toISOString().split('T')[0];
const SCREEN_WIDTH = Dimensions.get('window').width;

const MENU = ['HOME', 'GOALS', 'QUOTES', 'ANALYTICS'];

const initialTasks = {
  'Become INCREADIBLY RICH': [
    { id: 1, title: 'Solve 2 DSA questions', done: false },
    { id: 2, title: '45 min JavaScript learning', done: false },
  ],
  'Become INCREADIBLY MUSCULAR': [
    { id: 3, title: 'Predefined workout', done: false },
  ],
  'Become INCREADIBLY INTELLIGENT': [
    { id: 4, title: 'Read 10 pages', done: false },
    { id: 5, title: '30 min podcast/audiobook', done: false },
  ],
  'Become SOCIAL': [
    { id: 6, title: 'Talk to someone new / meaningful', done: false },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [menuOpen, setMenuOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [weeklyScore, setWeeklyScore] = useState([]);

  const today = getToday();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveTodayData();
  }, [tasks]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('zeroData');

      if (data) {
        const parsed = JSON.parse(data);

        if (parsed[today]) {
          const todayData = parsed[today];

          //  Merge new categories
          const merged = { ...initialTasks };

          Object.keys(initialTasks).forEach((category) => {
            if (todayData[category]) {
              merged[category] = todayData[category];
            }
          });

          setTasks(merged);
        } else {
          parsed[today] = initialTasks;
          await AsyncStorage.setItem('zeroData', JSON.stringify(parsed));
          setTasks(initialTasks);
        }

        calculateWeekly(parsed);
      } else {
        const newData = { [today]: initialTasks };
        await AsyncStorage.setItem('zeroData', JSON.stringify(newData));
        setTasks(initialTasks);
      }
    } catch (e) {
      console.log(e);
      setTasks(initialTasks);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const saveTodayData = async () => {
    try {
      const data = await AsyncStorage.getItem('zeroData');
      const parsed = data ? JSON.parse(data) : {};

      parsed[today] = tasks;

      await AsyncStorage.setItem('zeroData', JSON.stringify(parsed));
      calculateWeekly(parsed);
    } catch (e) {
      console.log(e);
    }
  };

  const calculateWeekly = (data) => {
    const dates = Object.keys(data).sort().reverse().slice(0, 7);

    const scores = dates.map((date) => {
      const dayTasks = Object.values(data[date]).flat();
      const done = dayTasks.filter((t) => t.done).length;
      return { date, done, total: dayTasks.length };
    });

    setWeeklyScore(scores);
  };

  const toggleTask = (category, id) => {
    const updated = { ...tasks };
    updated[category] = updated[category].map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setTasks(updated);
  };

  const toggleCategory = (category) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const totalTasks = Object.values(tasks).flat().length;
  const completedTasks = Object.values(tasks)
    .flat()
    .filter((t) => t.done).length;

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>ZERO</Text>
        <Text style={styles.splashTagline}>Everyone starts from zero</Text>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔝 Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>ZERO</Text>

        <View style={{ width: 20 }} />
      </View>

      {/* 📱 Screens */}
      <ScrollView>
        {activeTab === 'HOME' && (
          <HomeScreen
            tasks={tasks}
            expanded={expanded}
            toggleTask={toggleTask}
            toggleCategory={toggleCategory}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
          />
        )}

        {activeTab === 'ANALYTICS' && (
          <AnalyticsScreen
            weeklyScore={weeklyScore}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
          />
        )}

        {activeTab === 'GOALS' && <GoalsScreen />}
        {activeTab === 'QUOTES' && <QuotesScreen />}
      </ScrollView>

      {/* 🔥 Drawer Menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>ZERO</Text>

            {MENU.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setActiveTab(item);
                  setMenuOpen(false);
                }}
                style={styles.drawerItem}>
                <Text style={styles.drawerText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    paddingTop: 40,
  },

  splash: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  splashTitle: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },

  splashTagline: {
    color: '#777',
    marginBottom: 10,
  },

  // 🔝 Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  menuIcon: {
    color: '#fff',
    fontSize: 22,
  },

  logo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // 🔥 Drawer
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SCREEN_WIDTH * 0.7,
    height: '100%',
    backgroundColor: '#161616',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  drawerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  drawerItem: {
    paddingVertical: 14,
  },

  drawerText: {
    color: '#ddd',
    fontSize: 16,
  },

  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
