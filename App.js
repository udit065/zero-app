import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './components/HomeScreen';
import TodoScreen from './components/TodoScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import GoalsScreen from './components/GoalsScreen';
import QuotesScreen from './components/QuotesScreen';
import {
  getToday,
  defaultConfig,
  migrateDay,
  buildDay,
  daysBetween,
  REVIEW_EVERY_DAYS,
} from './lib/zero';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU = ['HOME', 'TODO', 'GOALS', 'QUOTES', 'ANALYTICS'];

const KEYS = { config: 'zeroConfig', history: 'zeroData', todos: 'zeroTodos' };

export default function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(getToday());

  const [config, setConfig] = useState(null);
  const [history, setHistory] = useState({});
  const [todos, setTodos] = useState([]);
  const [expanded, setExpanded] = useState({});

  // Nothing is written to storage until loading has finished, so
  // saved progress can never be overwritten by the defaults.
  const loaded = useRef(false);

  useEffect(() => {
    loadData();
    // Pick up a new day when the app comes back to the foreground.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setToday(getToday());
    });
    return () => sub.remove();
  }, []);

  const loadData = async () => {
    const t = getToday();
    try {
      const [rawConfig, rawHistory, rawTodos] = await Promise.all([
        AsyncStorage.getItem(KEYS.config),
        AsyncStorage.getItem(KEYS.history),
        AsyncStorage.getItem(KEYS.todos),
      ]);
      const cfg = rawConfig ? JSON.parse(rawConfig) : defaultConfig(t);
      const hist = {};
      Object.entries(rawHistory ? JSON.parse(rawHistory) : {}).forEach(
        ([date, day]) => (hist[date] = migrateDay(day))
      );
      hist[t] = buildDay(cfg, t, hist[t]);

      setConfig(cfg);
      setHistory(hist);
      setTodos(rawTodos ? JSON.parse(rawTodos) : []);
    } catch (e) {
      console.log(e);
      const cfg = defaultConfig(t);
      setConfig(cfg);
      setHistory({ [t]: buildDay(cfg, t) });
    } finally {
      loaded.current = true;
      setTimeout(() => setLoading(false), 800);
    }
  };

  // Keep today's list in sync with the goals config and the date.
  useEffect(() => {
    if (!config) return;
    setHistory((h) => ({ ...h, [today]: buildDay(config, today, h[today]) }));
  }, [config, today]);

  // Persist each piece separately.
  useEffect(() => {
    if (loaded.current && config)
      AsyncStorage.setItem(KEYS.config, JSON.stringify(config)).catch(console.log);
  }, [config]);
  useEffect(() => {
    if (loaded.current)
      AsyncStorage.setItem(KEYS.history, JSON.stringify(history)).catch(console.log);
  }, [history]);
  useEffect(() => {
    if (loaded.current)
      AsyncStorage.setItem(KEYS.todos, JSON.stringify(todos)).catch(console.log);
  }, [todos]);

  const updateToday = (fn) =>
    setHistory((h) => ({ ...h, [today]: fn(h[today]) }));

  const setTaskCount = (id, count) =>
    updateToday((day) => ({
      ...day,
      tasks: day.tasks.map((t) =>
        t.id === id ? { ...t, count: Math.max(0, Math.min(count, t.target)) } : t
      ),
    }));

  const setExtra = (extra) => updateToday((day) => ({ ...day, extra }));

  const markReviewed = () => setConfig((c) => ({ ...c, lastReview: today }));

  const toggleCategory = (goalId) =>
    setExpanded((prev) => ({ ...prev, [goalId]: !prev[goalId] }));

  if (loading || !config || !history[today]) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>ZERO</Text>
        <Text style={styles.splashTagline}>Everyone starts from zero</Text>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  const reviewDue =
    daysBetween(config.lastReview || today, today) >= REVIEW_EVERY_DAYS;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>ZERO</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Screens */}
      <ScrollView keyboardShouldPersistTaps="handled">
        {activeTab === 'HOME' && (
          <HomeScreen
            day={history[today]}
            expanded={expanded}
            toggleCategory={toggleCategory}
            setTaskCount={setTaskCount}
            setExtra={setExtra}
            reviewDue={reviewDue}
            onReview={() => setActiveTab('GOALS')}
            onReviewDismiss={markReviewed}
          />
        )}
        {activeTab === 'TODO' && <TodoScreen todos={todos} setTodos={setTodos} />}
        {activeTab === 'GOALS' && (
          <GoalsScreen
            config={config}
            setConfig={setConfig}
            today={today}
            markReviewed={markReviewed}
          />
        )}
        {activeTab === 'QUOTES' && <QuotesScreen />}
        {activeTab === 'ANALYTICS' && (
          <AnalyticsScreen history={history} today={today} />
        )}
      </ScrollView>

      {/* Drawer Menu */}
      {menuOpen && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setMenuOpen(false)}
          />
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
                <Text
                  style={[
                    styles.drawerText,
                    activeTab === item && styles.drawerTextActive,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b', paddingTop: 40 },
  splash: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  splashTagline: { color: '#777', marginBottom: 10 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  menuIcon: { color: '#fff', fontSize: 22 },
  logo: { color: '#fff', fontSize: 18, fontWeight: '700' },
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
  drawerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  drawerItem: { paddingVertical: 14 },
  drawerText: { color: '#ddd', fontSize: 16 },
  drawerTextActive: { color: '#4caf50', fontWeight: '700' },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
