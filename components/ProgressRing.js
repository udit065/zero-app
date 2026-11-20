import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../lib/theme';

export default function ProgressRing({
  progress = 0,
  size = 70,
  strokeWidth = 6,
  showLabel = true,
  label,
  sublabel,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const p = Math.max(0, Math.min(100, isNaN(progress) ? 0 : progress));
  const offset = circumference - (circumference * p) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#7ddc80" />
            <Stop offset="1" stopColor={colors.accentDark} />
          </LinearGradient>
        </Defs>
        <Circle
          stroke={colors.surfaceHigh}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {p > 0 && (
          <Circle
            stroke="url(#ring)"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>

      {showLabel && (
        <View style={styles.label}>
          <Text style={[styles.value, { fontSize: size * 0.24 }]}>
            {label ?? `${Math.round(p)}%`}
          </Text>
          {!!sublabel && <Text style={styles.sub}>{sublabel}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', alignItems: 'center' },
  value: { color: colors.text, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
});
