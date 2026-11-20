// Shared data helpers for ZERO.
//
// Storage layout (AsyncStorage):
//   zeroConfig  -> { goals: [{ id, name, tasks: [{ id, title, target, unit, days, group }] }], lastReview }
//   zeroData    -> { 'YYYY-MM-DD': { tasks: [{ id, goalId, goal, title, target, unit, group, count }], extra } }
//
// Tasks in the same goal with the same `group` name are alternatives ("pick one").
//   zeroTodos   -> [{ id, text, done }]   (never copied into history; deleting removes it for good)

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
      name: 'Become INCREADIBLY RICH',
      tasks: [
        { id: '1', title: 'Solve DSA questions', target: 2, unit: 'questions', days: ALL_DAYS },
        { id: '2', title: 'JavaScript learning', target: 45, unit: 'min', days: ALL_DAYS },
      ],
    },
    {
      id: 'g-muscular',
      name: 'Become INCREADIBLY MUSCULAR',
      tasks: [
        // Sunday off as a rest day — edit in Goals.
        { id: '3', title: 'Workout', target: 1, unit: '', days: [1, 2, 3, 4, 5, 6] },
      ],
    },
    {
      id: 'g-intelligent',
      name: 'Become INCREADIBLY INTELLIGENT',
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

// Old format was { [category]: [{ id, title, done }] }. Convert it to the new one.
export const migrateDay = (day) => {
  if (day && Array.isArray(day.tasks)) return day;
  const tasks = [];
  Object.entries(day || {}).forEach(([goal, list]) => {
    if (!Array.isArray(list)) return;
    list.forEach((t) =>
      tasks.push({
        id: String(t.id),
        goalId: goal,
        goal,
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
        count: Math.min(old?.count || 0, target),
      });
    })
  );
  return { tasks, extra: existing?.extra || emptyExtra() };
};

export const taskProgress = (t) => Math.min(t.count, t.target) / t.target;

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
