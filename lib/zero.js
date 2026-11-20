// Shared data helpers for ZERO.
//
// Storage layout (AsyncStorage):
//   zeroConfig  -> { goals: [{ id, name, tasks: [{ id, title, target, unit, days, group, min }] }],
//                   lastReview, reminder, weeklyDismissed }
//   zeroData    -> { 'YYYY-MM-DD': { tasks: [{ id, goalId, goal, title, target, unit, group, min, count, minDone }], extra } }
//   zeroTodos   -> [{ id, text, done }]   (never copied into history; deleting removes it for good)
//
// Tasks in the same goal with the same `group` name are alternatives ("pick one").
// `min` is a task's bad-day minimum version; doing it (`minDone`) counts as MIN_CREDIT.

export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const REVIEW_EVERY_DAYS = 30;

// Local date (not UTC), so the day changes at your midnight.
export const toKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
export const getToday = () => toKey(new Date());
export const weekdayOf = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};
export const daysBetween = (fromKey, toKeyStr) => {
  const [y1, m1, d1] = fromKey.split('-').map(Number);
  const [y2, m2, d2] = toKeyStr.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
};

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const safeTarget = (t) => Math.max(1, parseInt(t, 10) || 1);

export const defaultConfig = (today) => ({
  lastReview: today,
  goals: [
    {
      id: 'g-rich',
      name: 'Become INCREDIBLY RICH',
      tasks: [
        { id: '1', title: 'Solve DSA questions', target: 2, unit: 'questions', days: ALL_DAYS },
        { id: '2', title: 'JavaScript learning', target: 45, unit: 'min', days: ALL_DAYS },
      ],
    },
    {
      id: 'g-muscular',
      name: 'Become INCREDIBLY MUSCULAR',
      tasks: [
        // Sunday off as a rest day — edit in Goals.
        { id: '3', title: 'Workout', target: 1, unit: '', days: [1, 2, 3, 4, 5, 6] },
      ],
    },
    {
      id: 'g-intelligent',
      name: 'Become INCREDIBLY INTELLIGENT',
      tasks: [
        { id: '4', title: 'Read', target: 10, unit: 'pages', days: ALL_DAYS },
        { id: '5', title: 'Podcast / audiobook', target: 30, unit: 'min', days: ALL_DAYS },
      ],
    },
    {
      id: 'g-social',
      name: 'Become SOCIAL',
      tasks: [
        { id: '6', title: 'Talk to someone new / meaningful', target: 1, unit: '', days: ALL_DAYS },
      ],
    },
  ],
});

const emptyExtra = () => ({ title: '', done: false });

// Old builds saved goal names with a typo ("INCREADIBLY"). Fix it in saved data
// so stats don't split one goal into two names.
const fixName = (name) =>
  typeof name === 'string' ? name.replace(/INCREADIBLY/g, 'INCREDIBLY') : name;

export const migrateConfig = (config) => ({
  ...config,
  goals: (config.goals || []).map((g) => ({ ...g, name: fixName(g.name) })),
});

// Old format was { [category]: [{ id, title, done }] }. Convert it to the new one.
export const migrateDay = (day) => {
  if (day && Array.isArray(day.tasks))
    return { ...day, tasks: day.tasks.map((t) => ({ ...t, goal: fixName(t.goal) })) };
  const tasks = [];
  Object.entries(day || {}).forEach(([goal, list]) => {
    if (!Array.isArray(list)) return;
    list.forEach((t) =>
      tasks.push({
        id: String(t.id),
        goalId: goal,
        goal: fixName(goal),
        title: t.title,
        target: 1,
        unit: '',
        // 999 = "was fully done"; it is clamped to the real target later.
        count: t.done ? 999 : 0,
      })
    );
  });
  return { tasks, extra: emptyExtra() };
};

// Today's task list = tasks scheduled for this weekday, keeping any progress already made.
export const buildDay = (config, dateKey, existing) => {
  const weekday = weekdayOf(dateKey);
  const prev = existing?.tasks || [];
  const tasks = [];
  config.goals.forEach((g) =>
    g.tasks.forEach((t) => {
      if (!t.title.trim() || !(t.days || ALL_DAYS).includes(weekday)) return;
      const target = safeTarget(t.target);
      const old = prev.find((p) => p.id === t.id);
      tasks.push({
        id: t.id,
        goalId: g.id,
        goal: g.name,
        title: t.title.trim(),
        target,
        unit: t.unit || '',
        group: (t.group || '').trim(),
        min: (t.min || '').trim(),
        count: Math.min(old?.count || 0, target),
        minDone: !!(old?.minDone && (t.min || '').trim()),
      });
    })
  );
  return { tasks, extra: existing?.extra || emptyExtra() };
};

// Doing only a task's minimum version (bad-day fallback) counts as this much.
export const MIN_CREDIT = 0.25;

export const taskProgress = (t) =>
  Math.max(Math.min(t.count, t.target) / t.target, t.minDone ? MIN_CREDIT : 0);

// A "unit" is one thing that counts toward the score: either a single task, or
// a "pick one" group (tasks in the same goal with the same group name).
// A group's progress is its best option, so doing any one of them completes it.
export const unitsOf = (day) => {
  const units = [];
  const byKey = {};
  (day?.tasks || []).forEach((t) => {
    const key = t.group
      ? `${t.goalId}::${t.group.toLowerCase()}`
      : `task::${t.id}`;
    let u = byKey[key];
    if (!u) {
      u = byKey[key] = { key, goalId: t.goalId, goal: t.goal, group: t.group || '', tasks: [] };
      units.push(u);
    }
    u.tasks.push(t);
  });
  units.forEach((u) => {
    u.progress = Math.max(...u.tasks.map(taskProgress));
  });
  return units;
};

// Score of one day, 0..1. Partial progress counts; the "also" task counts once it is set.
export const dayScore = (day) => {
  if (!day) return 0;
  const parts = unitsOf(day).map((u) => u.progress);
  if (day.extra?.title) parts.push(day.extra.done ? 1 : 0);
  if (parts.length === 0) return 0;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
};

export const stepFor = (target) => (target >= 20 ? 5 : 1);

export const addDays = (key, n) => {
  const [y, m, d] = key.split('-').map(Number);
  return toKey(new Date(y, m - 1, d + n));
};

// Monday of the week containing `key`.
export const weekStart = (key) => addDays(key, -((weekdayOf(key) + 6) % 7));

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// Summary of the Mon–Sun week starting at `start` (days after `today` are ignored).
export const weekSummary = (history, start, today) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter(
    (d) => d <= today
  );
  const tracked = days.filter((d) => history[d]);
  const scores = tracked.map((d) => dayScore(history[d]));

  const goals = {};
  tracked.forEach((d) =>
    unitsOf(history[d]).forEach((u) => {
      (goals[u.goal] = goals[u.goal] || []).push(u.progress);
    })
  );
  const goalAvgs = Object.entries(goals)
    .map(([name, xs]) => ({ name, value: avg(xs) }))
    .sort((a, b) => b.value - a.value);

  return {
    start,
    average: avg(scores),
    trackedDays: tracked.length,
    perfectDays: scores.filter((s) => s >= 1).length,
    zeroDays: days.length - scores.filter((s) => s > 0).length,
    best: goalAvgs[0] || null,
    weakest: goalAvgs.length > 1 ? goalAvgs[goalAvgs.length - 1] : null,
  };
};

// The n days ending today, oldest first.
export const lastNDays = (today, n) => {
  const [y, m, d] = today.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => toKey(new Date(y, m - 1, d - (n - 1 - i))));
};

// Consecutive days with some progress. Today only counts once you've started it,
// and doesn't break the streak while it's still at zero.
export const noZeroStreak = (history, today) => {
  let streak = 0;
  for (const date of lastNDays(today, 365).reverse()) {
    const s = history[date] ? dayScore(history[date]) : 0;
    if (s > 0) streak++;
    else if (date !== today) break;
  }
  return streak;
};
