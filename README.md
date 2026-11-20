# ⭕ ZERO

> **Everyone starts from zero.**

ZERO is a minimal daily-discipline app built with React Native (Expo). You set a few core daily tasks under your life goals, track them (partial progress counts), and watch your progress ring fill up. Analytics show how consistent you've been.

## ✨ Features
- **Today's Focus**: daily tasks grouped by goal (Rich, Muscular, Intelligent, Social by default). Expand a goal to work through its tasks.
- **Pick-one groups**: put tasks in a goal into the same group (e.g. Learning = DSA OR JavaScript). Doing any one completes the group, and the group counts as one part of the goal.
- **Partial progress**: tasks can have a target and unit (e.g. `2 questions`, `45 min`). Use − / + to log progress; half done counts as half.
- **Weekday schedules**: each task can run on chosen days only (e.g. workout Mon–Sat, Sunday rest).
- **"Today I'll also…"**: one flexible task you set each morning, on top of your core tasks.
- **Goals editor**: add, rename and delete goals and tasks, with their targets, units and days, right in the app.
- **Monthly review**: every 30 days a reminder asks whether your tasks still fit.
- **To-do list**: quick everyday items (wash shoes, buy milk). Kept separate from goals and analytics; deleting one removes it completely.
- **Log yesterday**: forgot to log? Switch Today → Yesterday and catch up; stats and streak update.
- **Minimum version for bad days**: give a task a tiny fallback (e.g. "Read 1 page"). Doing it counts as 25% and keeps your streak alive.
- **Weekly summary**: on Sunday (this week) and Monday (last week), a card with your average, change vs the week before, 100% days, and your strongest and weakest goal.
- **Backup**: export your goals and history to a file (Drive, WhatsApp, email) and import it again on any phone. To-dos are never included.
- **Home-screen widget** (installed APK): today's ring, tasks done and streak; tap to open the app.
- **Daily reminder**: a notification every day at 9:30 PM to log your progress (time adjustable, can be turned off)
- **Stats**: today, 7-day average, streak, 100% days, a 7-day chart, a 5-week heatmap and per-goal progress
- **Polished dark UI**: bottom tab bar, progress hero card, checkboxes, steppers, task editor sheet, haptic feedback, quote of the day
- **Offline**: no backend and no account; everything stays on your phone (AsyncStorage)

## 🛠️ Tech stack
React Native 0.88 · Expo SDK 58 · React 19 · AsyncStorage · expo-notifications · react-native-svg · Ionicons · expo-haptics · react-native-android-widget

## 📁 Project structure
```
zero-app/
├── index.js                 entry point, registers the widget
├── App.js                   app shell, tab bar, state, persistence, reminder
├── lib/
│   ├── zero.js              data model, dates, scoring, streaks, migration
│   ├── theme.js             colours, spacing, type
│   ├── notifications.js     daily reminder scheduling
│   ├── quotes.js            quotes and quote of the day
│   ├── backup.js            export / import backup files
│   └── widget.js            safe loader for the home-screen widget
└── components/
    ├── ui.js                shared UI pieces (cards, checkboxes, buttons…)
    ├── HomeScreen.js        today: progress, tasks, flexible task
    ├── TodoScreen.js        everyday to-do list
    ├── GoalsScreen.js       goals list and task editor sheet
    ├── AnalyticsScreen.js   stats, charts and heatmap
    ├── MoreScreen.js        reminder settings and quotes
    └── ProgressRing.js      SVG progress ring
widget/
├── ZeroWidget.js            widget layout (Android)
└── summary.js               numbers shown on the widget
```

## 🚀 Run locally
```bash
git clone https://github.com/udit065/zero-app.git
cd zero-app
npm install
npx expo start
```
Scan the QR code with **Expo Go** on your phone, or press `a` for an Android emulator or `i` for the iOS simulator.

## 🎯 Customizing your tasks
Open **Goals** from the menu to edit goals and tasks. Changes apply from today onward, and past days keep their history. The starting tasks are set in `defaultConfig` in `lib/zero.js`.

## 👤 Author
**Udit Yadav** · [GitHub](https://github.com/udit065) · [LinkedIn](https://www.linkedin.com/in/udit-yadav065)
