// Builds the data shown on the home-screen widget. No widget-library imports here,
// so this file is safe to use inside Expo Go.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getToday,
  defaultConfig,
  migrateDay,
  migrateConfig,
  buildDay,
  dayScore,
  unitsOf,
  noZeroStreak,
} from '../lib/zero';

export const summaryFrom = (config, history, today) => {
  const day = history[today] || buildDay(config, today);
  const units = unitsOf(day);
  const extraSet = !!day.extra?.title;
  return {
    score: dayScore(day),
    done: units.filter((u) => u.progress >= 1).length + (extraSet && day.extra.done ? 1 : 0),
    total: units.length + (extraSet ? 1 : 0),
    streak: noZeroStreak(history, today),
  };
};

// Used when the widget refreshes on its own (the app may not be running).
export const loadSummary = async () => {
  const today = getToday();
  const [rawConfig, rawHistory] = await Promise.all([
    AsyncStorage.getItem('zeroConfig'),
    AsyncStorage.getItem('zeroData'),
  ]);
  const config = migrateConfig(rawConfig ? JSON.parse(rawConfig) : defaultConfig(today));
  const history = {};
  Object.entries(rawHistory ? JSON.parse(rawHistory) : {}).forEach(
    ([date, d]) => (history[date] = migrateDay(d))
  );
  history[today] = buildDay(config, today, history[today]);
  return summaryFrom(config, history, today);
};
