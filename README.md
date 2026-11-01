# ⭕ ZERO

> **Everyone starts from zero.**

ZERO is a minimal daily-discipline app built with React Native (Expo). You get a fixed set of daily tasks grouped under four life goals, you tick them off, and you watch your progress ring fill up. A 7-day analytics view shows how consistent you've been.

## ✨ Features
- **Today's Focus**: daily tasks grouped into four goals (Rich, Muscular, Intelligent, Social). Expand a goal to tick off its tasks.
- **Progress ring**: an animated SVG ring that shows how much of today's tasks you've finished
- **Daily reset with history**: each day starts fresh, and every past day is saved on the device with AsyncStorage
- **Analytics**: completed vs total tasks for each of the last 7 days
- **Quotes**: a screen of motivational quotes
- **Goals**: a screen for longer-term goals
- Dark UI, a splash screen, and a slide-out menu to move between Home, Goals, Quotes and Analytics
- **Offline**: no backend and no account; everything stays on your phone

## 🛠️ Tech stack
React Native 0.81 · Expo SDK 54 · React 19 · AsyncStorage · react-native-svg · React Native Paper · Expo Vector Icons

## 📁 Project structure
```
zero-app/
├── App.js                   app shell, menu, state, persistence, weekly stats
└── components/
    ├── HomeScreen.js        today's tasks grouped by goal
    ├── ProgressRing.js      SVG progress ring
    ├── AnalyticsScreen.js   last-7-days view
    ├── GoalsScreen.js       long-term goals
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
Daily tasks are defined in `initialTasks` at the top of `App.js`. Edit the goal names or tasks there, and new ones are merged into today's list automatically.

## 👤 Author
**Udit Yadav** · [GitHub](https://github.com/udit065) · [LinkedIn](https://www.linkedin.com/in/udit-yadav065)
