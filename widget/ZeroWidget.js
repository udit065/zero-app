// Home-screen widgets (Android, installed APK only). Imports the native widget
// library, so only load this file through lib/widget.js.
//
// Three layouts:
//   ZeroBuddy  2x1  Duolingo-style: streak on top, short nudge, the "O" buddy peeking up
//   ZeroRing   2x2  just the progress ring and the streak
//   ZeroToday  4x1  slim bar: tasks done, streak and a small ring
import React from 'react';
import { FlexWidget, TextWidget, SvgWidget } from 'react-native-android-widget';

const GREEN = '#4cc764';
const clamp = (n) => Math.max(0, Math.min(1, n || 0));

// ---- shared bits -----------------------------------------------------------

// Mood of the day decides colours, the buddy's face and the nudge text.
const moodOf = ({ score = 0, hour = 12 }) => {
  if (score >= 1) return 'done';
  if (score > 0) return hour >= 20 ? 'late' : 'going';
  return hour >= 18 ? 'urgent' : 'fresh';
};

const BACKGROUNDS = {
  done: { from: '#4cc764', to: '#23913d' },
  going: { from: '#3b7bea', to: '#2149a8' },
  late: { from: '#4a3a9c', to: '#1f1a52' },
  fresh: { from: '#2f2f35', to: '#141416' },
  urgent: { from: '#f0643f', to: '#b8321f' },
};

const nudge = ({ score = 0, done = 0, total = 0 }, mood) => {
  const left = Math.max(0, total - done);
  if (mood === 'done') return 'Day complete!';
  if (mood === 'urgent') return 'Don’t end on zero!';
  if (mood === 'fresh') return total ? `${total} tasks today` : 'Start from zero';
  if (mood === 'late') return left === 1 ? 'One more, then sleep' : `${left} left before bed`;
  return left === 1 ? 'Just 1 left' : `${left} left today`;
};

const streakText = (streak) => (streak > 0 ? `🔥 ${streak}` : '🔥 0');

const arc = (cx, cy, r, p, color, width) => {
  if (p <= 0) return '';
  const c = 2 * Math.PI * r;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"
    stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 ${cx} ${cy})"/>`;
};

// ---- the "O" buddy -----------------------------------------------------------
// ZERO's mascot is the ring itself: the ring fills as the day fills, the face
// reacts to how the day is going. Drawn so it peeks up from the widget's bottom edge.
const buddy = (score, mood) => {
  const p = clamp(score);
  const cx = 80;
  const cy = 74;
  const r = 40;

  const eye = (x) =>
    mood === 'done'
      ? // happy closed eyes ^ ^
        `<path d="M${x - 8} 66 Q${x} 56 ${x + 8} 66" fill="none" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round"/>`
      : `<ellipse cx="${x}" cy="64" rx="8" ry="${mood === 'urgent' ? 10 : 9}" fill="#ffffff"/>
         <circle cx="${x + (mood === 'late' ? 0 : 2)}" cy="${mood === 'late' ? 67 : 65}" r="4.2" fill="#1b1b1f"/>`;

  const lids =
    mood === 'late' // sleepy lids
      ? `<path d="M60 58 h16 M84 58 h16" stroke="#3a2f80" stroke-width="7" stroke-linecap="round"/>`
      : mood === 'urgent' // worried brows
      ? `<path d="M60 51 L73 54 M100 51 L87 54" stroke="#1b1b1f" stroke-width="3.5" stroke-linecap="round"/>`
      : '';

  const extras =
    mood === 'done'
      ? `<path d="M22 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#fff6b0"/>
         <path d="M134 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff6b0"/>`
      : mood === 'late'
      ? `<text x="122" y="30" font-size="15" font-weight="bold" font-family="sans-serif" fill="#c9c2ff">z</text>
         <text x="134" y="18" font-size="11" font-weight="bold" font-family="sans-serif" fill="#c9c2ff">z</text>`
      : mood === 'urgent'
      ? `<path d="M118 34 q4 8 0 12 q-4 -4 0 -12z" fill="#bfe6ff"/>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90" viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMax meet">
    ${extras}
    <circle cx="${cx}" cy="${cy}" r="${r - 7}" fill="#ffffff" fill-opacity="0.16"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="13"/>
    ${arc(cx, cy, r, p, mood === 'done' ? '#ffffff' : '#ffd84d', 13)}
    ${eye(68)}${eye(92)}
    ${lids}
  </svg>`;
};

// ---- 1. ZeroBuddy (Duolingo-style, 2x1) -------------------------------------
export function ZeroBuddyWidget(props) {
  const { score = 0, streak = 0 } = props;
  const mood = moodOf(props);
  const bg = BACKGROUNDS[mood];
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundGradient: { ...bg, orientation: 'TOP_BOTTOM' },
        borderRadius: 24,
        paddingTop: 8,
        alignItems: 'center',
      }}>
      <TextWidget
        text={streakText(streak)}
        style={{ fontSize: 18, color: '#ffffff', fontWeight: '800' }}
      />
      <TextWidget
        text={nudge(props, mood)}
        maxLines={1}
        style={{ fontSize: 12, color: '#ffffff', fontWeight: '600', marginTop: 1 }}
      />
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'flex-end' }}>
        <SvgWidget svg={buddy(score, mood)} style={{ height: 'match_parent', width: 'match_parent' }} />
      </FlexWidget>
    </FlexWidget>
  );
}

// ---- 2. ZeroRing (small square) ---------------------------------------------
const bigRing = (score, done, total) => {
  const p = clamp(score);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2e" stroke-width="10"/>
    ${arc(50, 50, 40, p, GREEN, 10)}
    <text x="50" y="54" text-anchor="middle" font-size="22" font-weight="bold"
      font-family="sans-serif" fill="#f5f5f5">${done}/${total}</text>
    <text x="50" y="69" text-anchor="middle" font-size="10" font-weight="bold"
      font-family="sans-serif" fill="#8a8a8f">${Math.round(p * 100)}%</text>
  </svg>`;
};

export function ZeroRingWidget({ score = 0, done = 0, total = 0, streak = 0 }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#141416',
        borderRadius: 26,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <FlexWidget style={{ flex: 1, width: 'match_parent', alignItems: 'center', justifyContent: 'center' }}>
        <SvgWidget svg={bigRing(score, done, total)} style={{ height: 'match_parent', width: 'match_parent' }} />
      </FlexWidget>
      <TextWidget
        text={streak > 0 ? `🔥 ${streak}-day streak` : 'No streak yet'}
        style={{ fontSize: 12, color: streak > 0 ? '#e8a33d' : '#6a6a6f', fontWeight: '700', marginTop: 4 }}
      />
    </FlexWidget>
  );
}

// ---- 3. ZeroToday (slim wide bar, 4x1) --------------------------------------
const smallRing = (score) => {
  const p = clamp(score);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="38" fill="none" stroke="#2a2a2e" stroke-width="14"/>
    ${arc(50, 50, 38, p, GREEN, 14)}
    <text x="50" y="58" text-anchor="middle" font-size="24" font-weight="bold"
      font-family="sans-serif" fill="#f5f5f5">${Math.round(p * 100)}</text>
  </svg>`;
};

export function ZeroWidget(props) {
  const { score = 0, done = 0, total = 0, streak = 0 } = props;
  const mood = moodOf(props);
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#141416',
        borderRadius: 40,
        paddingLeft: 20,
        paddingRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <FlexWidget style={{ flex: 1 }}>
        <TextWidget
          text={nudge(props, mood)}
          maxLines={1}
          style={{ fontSize: 13, color: '#9a9aa0', fontWeight: '600' }}
        />
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <TextWidget
            text={`${done}/${total}`}
            style={{ fontSize: 26, color: '#f5f5f5', fontWeight: '800' }}
          />
          <TextWidget
            text={streakText(streak)}
            style={{
              fontSize: 14,
              color: streak > 0 ? '#e8a33d' : '#6a6a6f',
              fontWeight: '700',
              marginLeft: 12,
            }}
          />
        </FlexWidget>
      </FlexWidget>
      <SvgWidget svg={smallRing(score)} style={{ height: 58, width: 58 }} />
    </FlexWidget>
  );
}

// Pick the layout for a widget name (see app.json).
export const WIDGETS = {
  ZeroBuddy: ZeroBuddyWidget,
  ZeroRing: ZeroRingWidget,
  ZeroToday: ZeroWidget,
};
