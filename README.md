# ⭕ ZERO

> **Everyone starts from zero.**

ZERO is a minimal daily-discipline app built with React Native (Expo). You set a few core daily tasks under your life goals, track them (partial progress counts), and watch your progress ring fill up. Analytics show how consistent you've been.

## ✨ Features
- **Today's Focus**: daily tasks grouped by goal (Rich, Muscular, Intelligent, Social by default). Expand a goal to work through its tasks.
- **Partial progress**: tasks can have a target and unit (e.g. `2 questions`, `45 min`). Use − / + to log progress; half done counts as half.
- **Weekday schedules**: each task can run on chosen days only (e.g. workout Mon–Sat, Sunday rest).
- **"Today I'll also…"**: one flexible task you set each morning, on top of your core tasks.
- **Goals editor**: add, rename and delete goals and tasks, with their targets, units and days, right in the app.
- **Monthly review**: every 30 days a reminder asks whether your tasks still fit.
- **To-do list**: quick everyday items (wash shoes, buy milk). Kept separate from goals and analytics; deleting one removes it completely.
- **Analytics**: today's score, 7-day average, a "no-zero" streak, a 7-day bar chart and a breakdown for each goal.
- **Progress ring**, **Quotes** screen, dark UI, splash screen and a slide-out menu
- **Offline**: no backend and no account; everything stays on your phone (AsyncStorage)

## 🛠️ Tech stack
React Native 0.81 · Expo SDK 54 · React 19 · AsyncStorage · react-native-svg · React Native Paper · Expo Vector Icons

## 📁 Project structure
```
zero-app/
├── App.js                   app shell, menu, state and persistence
├── lib/
│   └── zero.js              data model, dates, scoring, migration
└── components/
    ├── HomeScreen.js        today's tasks, progress and the flexible task
    ├── TodoScreen.js        everyday to-do list
    ├── GoalsScreen.js       goals and core-task editor
    ├── AnalyticsScreen.js   scores, streak and charts
    ├── ProgressRing.js      SVG progress ring
    └── QuotesScreen.js      motivational quotes
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
