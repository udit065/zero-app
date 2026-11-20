import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  AppState,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './components/HomeScreen';
import TodoScreen from './components/TodoScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import GoalsScreen from './components/GoalsScreen';
import MoreScreen from './components/MoreScreen';
import ProgressRing from './components/ProgressRing';
import { tap } from './components/ui';
import { colors, space } from './lib/theme';
import { applyReminder, DEFAULT_REMINDER } from './lib/notifications';
import { updateWidget } from './lib/widget';
import { summaryFrom } from './widget/summary';
import {
  getToday,
  addDays,
  defaultConfig,
  migrateDay,
  migrateConfig,
  buildDay,
  daysBetween,
  REVIEW_EVERY_DAYS,
} from './lib/zero';

const TABS = [
  { key: 'HOME', label: 'Today', icon: 'sunny' },
  { key: 'TODO', label: 'To-do', icon: 'checkbox' },
  { key: 'GOALS', label: 'Goals', icon: 'flag' },
  { key: 'ANALYTICS', label: 'Stats', icon: 'stats-chart' },
  { key: 'MORE', label: 'More', icon: 'ellipsis-horizontal-circle' },
];

const KEYS = { config: 'zeroConfig', history: 'zeroData', todos: 'zeroTodos' };

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Zero />
    </SafeAreaProvider>
  );
}

function Zero() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState('HOME');
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(getToday());

  const [config, setConfig] = useState(null);
  const [history, setHistory] = useState({});
  const [todos, setTodos] = useState([]);
  const [reminderStatus, setReminderStatus] = useState(null);
  // Today, or yesterday for catching up on progress you forgot to log.
  const [viewing, setViewing] = useState('today');

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
      const cfg = migrateConfig(rawConfig ? JSON.parse(rawConfig) : defaultConfig(t));
      if (!cfg.reminder) cfg.reminder = DEFAULT_REMINDER;
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
      const cfg = { ...defaultConfig(t), reminder: DEFAULT_REMINDER };
      setConfig(cfg);
      setHistory({ [t]: buildDay(cfg, t) });
    } finally {
      loaded.current = true;
      setTimeout(() => setLoading(false), 700);
    }
  };

  // Keep today's list in sync with the goals config and the date.
  useEffect(() => {
    if (!config) return;
    setHistory((h) => ({ ...h, [today]: buildDay(config, today, h[today]) }));
  }, [config, today]);

  // (Re)schedule the daily reminder whenever its settings change.
  const reminderKey = config?.reminder ? JSON.stringify(config.reminder) : null;
  useEffect(() => {
    if (!reminderKey) return;
    applyReminder(config.reminder)
      .then(setReminderStatus)
      .catch((e) => {
        console.log(e);
        setReminderStatus('error');
      });
  }, [reminderKey]);

  // Keep the home-screen widget in sync (no-op in Expo Go).
  useEffect(() => {
    if (loaded.current && config && history[today])
      updateWidget(summaryFrom(config, history, today));
  }, [history, config, today]);

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

  const yesterday = addDays(today, -1);
  const viewDate = viewing === 'yesterday' ? yesterday : today;
  // A day you never opened the app on is built from your current goals.
  const dayFor = (date) => history[date] || (config ? buildDay(config, date) : null);

  const updateDay = (fn) =>
    setHistory((h) => ({
      ...h,
      [viewDate]: fn(h[viewDate] || buildDay(config, viewDate)),
    }));

  const updateTask = (id, patch) =>
    updateDay((day) => ({
      ...day,
      tasks: day.tasks.map((t) => (t.id === id ? { ...t, ...patch(t) } : t)),
    }));

  const setTaskCount = (id, count) =>
    updateTask(id, (t) => ({ count: Math.max(0, Math.min(count, t.target)) }));

  const setTaskMin = (id, minDone) => updateTask(id, () => ({ minDone }));

  const setExtra = (extra) => updateDay((day) => ({ ...day, extra }));

  const dismissWeekly = (start) => setConfig((c) => ({ ...c, weeklyDismissed: start }));

  // Replace everything (except to-dos) with a backup.
  const restoreBackup = (backup) => {
    const cfg = { ...backup.config, reminder: backup.config.reminder || DEFAULT_REMINDER };
    const hist = { ...backup.history };
    hist[today] = buildDay(cfg, today, hist[today]);
    setConfig(cfg);
    setHistory(hist);
    setViewing('today');
  };
  const markReviewed = () => setConfig((c) => ({ ...c, lastReview: today }));
  const setReminder = (reminder) => setConfig((c) => ({ ...c, reminder }));

  const goTo = (tab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  if (loading || !config || !history[today]) {
    return (
      <View style={styles.splash}>
        <ProgressRing progress={72} size={96} strokeWidth={10} showLabel={false} />
        <Text style={styles.splashTitle}>ZERO</Text>
        <Text style={styles.splashTagline}>Everyone starts from zero</Text>
      </View>
    );
  }

  const reviewDue = daysBetween(config.lastReview || today, today) >= REVIEW_EVERY_DAYS;
  const openTodos = todos.filter((t) => !t.done).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          {activeTab === 'HOME' && (
            <HomeScreen
              today={today}
              viewDate={viewDate}
              viewing={viewing}
              setViewing={setViewing}
              day={dayFor(viewDate)}
              history={history}
              setTaskCount={setTaskCount}
              setTaskMin={setTaskMin}
              setExtra={setExtra}
              weeklyDismissed={config.weeklyDismissed}
              onDismissWeekly={dismissWeekly}
              reviewDue={reviewDue}
              onReview={() => goTo('GOALS')}
              onReviewDismiss={markReviewed}
              openTodos={openTodos}
              onOpenTodos={() => goTo('TODO')}
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
          {activeTab === 'ANALYTICS' && <AnalyticsScreen history={history} today={today} />}
          {activeTab === 'MORE' && (
            <MoreScreen
              reminder={config.reminder}
              setReminder={setReminder}
              reminderStatus={reminderStatus}
              config={config}
              history={history}
              today={today}
              onRestore={restoreBackup}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom tab bar */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              style={styles.tab}
              onPress={() => {
                if (!active) tap();
                goTo(t.key);
              }}>
              <View>
                <Ionicons
                  name={active ? t.icon : `${t.icon}-outline`}
                  size={23}
                  color={active ? colors.accent : colors.textFaint}
                />
                {t.key === 'TODO' && openTodos > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{openTodos > 9 ? '9+' : openTodos}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, active && { color: colors.accent }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl },
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 6,
    marginTop: space.xl,
  },
  splashTagline: { color: colors.textMuted, marginTop: space.xs },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 11, color: colors.textFaint, marginTop: 3, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
