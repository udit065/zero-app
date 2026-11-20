// Home-screen widget (Android, installed APK only). Imports the native widget
// library, so only load this file through lib/widget.js.
import React from 'react';
import { FlexWidget, TextWidget, SvgWidget } from 'react-native-android-widget';

const ring = (score) => {
  const r = 40;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, score));
  const arc =
    p > 0
      ? `<circle cx="50" cy="50" r="${r}" fill="none" stroke="#4cc764" stroke-width="10"
           stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 50 50)"/>`
      : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="#262626" stroke-width="10"/>
    ${arc}
    <text x="50" y="57" text-anchor="middle" font-size="22" font-weight="bold"
      font-family="sans-serif" fill="#f5f5f5">${Math.round(p * 100)}%</text>
  </svg>`;
};

const message = (score) => {
  if (score >= 1) return 'Day complete';
  if (score > 0) return 'Keep going';
  return 'Start from zero';
};

export function ZeroWidget({ score = 0, done = 0, total = 0, streak = 0 }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#141414',
        borderRadius: 22,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <SvgWidget svg={ring(score)} style={{ height: 82, width: 82 }} />
      <FlexWidget style={{ marginLeft: 14, flex: 1 }}>
        <TextWidget
          text="ZERO · TODAY"
          style={{ fontSize: 11, color: '#7a7a7a', fontWeight: '700', letterSpacing: 0.1 }}
        />
        <TextWidget
          text={message(score)}
          style={{ fontSize: 17, color: '#f5f5f5', fontWeight: '700', marginTop: 2 }}
        />
        <TextWidget
          text={`${done} of ${total} done`}
          style={{ fontSize: 13, color: '#9a9a9a', marginTop: 2 }}
        />
        <TextWidget
          text={streak > 0 ? `🔥 ${streak}-day streak` : 'No streak yet'}
          style={{ fontSize: 13, color: streak > 0 ? '#e8a33d' : '#5e5e5e', marginTop: 4 }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
